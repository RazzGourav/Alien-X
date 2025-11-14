from google.cloud import firestore
from google.cloud import bigquery
from google.oauth2 import service_account
import datetime
import os
import random

# --- CONFIGURATION ---
KEY_PATH = "lumenai-478205-a6f308224f9f.json"

# Verify key exists
if not os.path.exists(KEY_PATH):
    raise FileNotFoundError(f"CRITICAL: Missing key file at {KEY_PATH}")

# Load Credentials
credentials = service_account.Credentials.from_service_account_file(KEY_PATH)

# Initialize Clients with explicit credentials
fs_client = firestore.Client(credentials=credentials)
bq_client = bigquery.Client(credentials=credentials)

# Correct BigQuery Table Reference (Project.Dataset.Table)
FULL_TABLE_ID = "lumenai-478205.lumen_financial_data.expenses"

def save_transaction(data: dict, user_id: str):
    print(f"Saving transaction for {user_id}...")

    # 1. Add Metadata
    data["user_id"] = user_id
    data["timestamp"] = datetime.datetime.now().isoformat()
    
    # 2. Save to Firestore (Transaction Doc)
    doc_ref = fs_client.collection("users").document(user_id).collection("transactions").document()
    doc_ref.set(data)
    print(f"Saved to Firestore: {doc_ref.id}")
    
    # 3. Save to BigQuery
    rows_to_insert = [{
        "user_id": user_id,
        "merchant": data.get("merchant_name", "Unknown"),
        "amount": float(data.get("total_amount", 0)),
        "date": data.get("date", None),
        "category": "Uncategorized" 
    }]
    errors = bq_client.insert_rows_json(FULL_TABLE_ID, rows_to_insert)
    if errors:
        print(f"BigQuery Errors: {errors}")

    # --- START REWARD SIMULATION (FEATURE 2) ---
    # We simulate a 1-in-5 chance (20%) of getting the "Instant Capture" bonus
    if random.randint(1, 5) == 1:
        print("SIMULATION: User hit the 20% chance for 'Speed Demon'!")
        _add_rewards(user_id, 50, "Speed Demon")
    # --- END REWARD SIMULATION ---
        
    return doc_ref.id

def save_financial_settings(user_id: str, salary: float, limit: float):
    """Saves user's financial settings to Firestore."""
    try:
        doc_ref = fs_client.collection("users").document(user_id)
        # merge=True ensures we don't overwrite other user data
        doc_ref.set({"salary": salary, "limit": limit}, merge=True)
        print(f"Saved settings for {user_id}")
        return {"status": "success"}
    except Exception as e:
        print(f"Firestore Save Settings Error: {e}")
        raise

def get_financial_settings(user_id: str):
    """Gets user's financial settings, points, and badges from Firestore."""
    try:
        doc_ref = fs_client.collection("users").document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            # Ensure defaults if fields are missing
            if 'salary' not in data: data['salary'] = 0
            if 'limit' not in data: data['limit'] = 0
            if 'points' not in data: data['points'] = 0
            if 'badges' not in data: data['badges'] = []
            return data
        else:
            # Return defaults for a new user
            return {"salary": 0, "limit": 0, "points": 0, "badges": []}
    except Exception as e:
        print(f"Firestore Get Settings Error: {e}")
        raise
def _add_rewards(user_id: str, points_to_add: int, badge_to_add: str = None):
    """
    Atomically adds points and/or a new badge to a user's Firestore doc.
    """
    try:
        doc_ref = fs_client.collection("users").document(user_id)
        
        update_data = {
            "points": firestore.Increment(points_to_add)
        }
        
        # Only add the badge if it's new
        if badge_to_add:
            update_data["badges"] = firestore.ArrayUnion([badge_to_add])
            
        # Use set with merge=True to create/update fields
        doc_ref.set(update_data, merge=True) 
        print(f"Added {points_to_add} points and badge '{badge_to_add}' for {user_id}")
        
    except Exception as e:
        print(f"Firestore Reward Error: {e}")
        # Non-fatal error, don't crash the upload

def get_analysis_data(user_id: str):
    """
    Runs multiple BigQuery aggregations to get data for the AI Analysis page.
    """
    
    # --- 1. Get Financial Settings (Salary & Limit) ---
    settings_doc = fs_client.collection("users").document(user_id).get()
    if settings_doc.exists:
        settings = settings_doc.to_dict()
        salary = settings.get("salary", 0)
        limit = settings.get("limit", 0)
    else:
        salary = 0
        limit = 0

    # --- 2. Get Spending by Category (Pie Chart) ---
    category_query = f"""
        SELECT category, SUM(amount) as total
        FROM `{FULL_TABLE_ID}`
        WHERE user_id = @user_id
        GROUP BY category
    """
    job_config_cat = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )
    category_rows = bq_client.query(category_query, job_config=job_config_cat).result()
    # Format: [{"name": "Dining", "value": 250}, ...]
    spending_by_category = [{"name": row.category, "value": row.total} for row in category_rows]

    # --- 3. Get Spending Over Time (Line Chart - Last 30 Days) ---
    # Using DATE() to cast timestamp/datetime to date if needed
    line_chart_query = f"""
        SELECT DATE(date) as day, SUM(amount) as total
        FROM `{FULL_TABLE_ID}`
        WHERE user_id = @user_id AND DATE(date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        GROUP BY day
        ORDER BY day ASC
    """
    job_config_line = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )
    line_chart_rows = bq_client.query(line_chart_query, job_config=job_config_line).result()
    # Format: [{"name": "Nov 13", "total": 80}, ...]
    spending_over_time = [{"name": row.day.strftime("%b %d"), "total": row.total} for row in line_chart_rows]

    # --- 4. Get This Month's Total Spend (Bar Chart) ---
    # Using EXTRACT to get month and year
    monthly_spend_query = f"""
        SELECT SUM(amount) as total
        FROM `{FULL_TABLE_ID}`
        WHERE user_id = @user_id 
          AND EXTRACT(MONTH FROM DATE(date)) = EXTRACT(MONTH FROM CURRENT_DATE())
          AND EXTRACT(YEAR FROM DATE(date)) = EXTRACT(YEAR FROM CURRENT_DATE())
    """
    job_config_monthly = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )

# --- START FIX ---
# The .result() is an iterator. We get the first (and only) row from it.
    monthly_spend_result = bq_client.query(monthly_spend_query, job_config=job_config_monthly).result()
    monthly_row = next(iter(monthly_spend_result), None) 
# --- END FIX ---

    total_spent_this_month = monthly_row.total if monthly_row and monthly_row.total else 0
    
    # --- 5. AI Insight: Top Category ---
    top_category = max(spending_by_category, key=lambda x: x['value'], default=None)
    
    # --- 6. AI Insight: Anomaly (e.g., Uncategorized) ---
    uncategorized_spend = next((item['value'] for item in spending_by_category if item['name'] == 'Uncategorized'), 0)

    return {
        "summary_stats": {
            "salary": salary,
            "limit": limit,
            "total_spent_this_month": total_spent_this_month
        },
        "spending_by_category": spending_by_category,
        "spending_over_time": spending_over_time,
        "ai_insights": {
            "top_category": top_category,
            "uncategorized_spend": uncategorized_spend
        }
    }
# --- 5. ADD THIS NEW FUNCTION (for "Budget Sniper") ---
def calculate_budget_sniper_reward(user_id: str):
    """
    Checks last month's spending against the limit and awards points.
    This simulates the monthly cron job.
    """
    
    # 1. Get user's limit from settings
    settings = get_financial_settings(user_id)
    limit = settings.get("limit", 0)
    
    if limit == 0:
        return {"status": "no_limit_set", "points_awarded": 0}

    # 2. Get LAST month's total spend from BigQuery
    today = datetime.date.today()
    first_day_of_current_month = today.replace(day=1)
    last_day_of_last_month = first_day_of_current_month - datetime.timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)
    
    last_month_spend_query = f"""
        SELECT SUM(amount) as total
        FROM `{FULL_TABLE_ID}`
        WHERE user_id = @user_id 
          AND DATE(date) >= @start_date
          AND DATE(date) <= @end_date
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
            bigquery.ScalarQueryParameter("start_date", "DATE", first_day_of_last_month),
            bigquery.ScalarQueryParameter("end_date", "DATE", last_day_of_last_month),
        ]
    )
    
    spend_row = bq_client.query(last_month_spend_query, job_config=job_config).result().fetchone()
    last_month_spend = spend_row.total if spend_row and spend_row.total else 0
    
    # 3. Calculate reward
    savings = limit - last_month_spend
    
    if savings > 0:
        # 10 points per $1 saved
        points_awarded = int(savings * 10)
        
        # Add points and "Budget Sniper" badge
        _add_rewards(user_id, points_awarded, "Budget Sniper")
        
        return {
            "status": "reward_granted",
            "points_awarded": points_awarded,
            "savings": savings,
            "spend": last_month_spend,
            "limit": limit
        }
    else:
        return {
            "status": "no_reward",
            "points_awarded": 0,
            "savings": savings,
            "spend": last_month_spend,
            "limit": limit
        }

def redeem_points(user_id: str):
    """
    Checks user's points and subtracts 1000 (for $10) if they have enough.
    """
    
    # 1. Get user's current points
    user_data = get_financial_settings(user_id) # This function already exists
    current_points = user_data.get("points", 0)
    
    REDEEM_THRESHOLD = 1000 # 1000 points = $10
    
    if current_points >= REDEEM_THRESHOLD:
        try:
            # 2. Atomically subtract 1000 points
            doc_ref = fs_client.collection("users").document(user_id)
            doc_ref.set({
                "points": firestore.Increment(-REDEEM_THRESHOLD)
            }, merge=True)
            
            # In a real app, you would also trigger a payout here (e.g., Stripe)
            
            return {
                "status": "success",
                "points_redeemed": REDEEM_THRESHOLD,
                "dollars_redeemed": 10
            }
        except Exception as e:
            print(f"Redeem Error: {e}")
            return {"status": "error", "message": str(e)}
    else:
        # 3. Not enough points
        return {
            "status": "insufficient_points",
            "current_points": current_points,
            "needed_points": REDEEM_THRESHOLD
        }