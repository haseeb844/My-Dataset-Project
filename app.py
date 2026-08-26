import csv
import re
from pathlib import Path

from flask import Flask, abort, render_template, request

folder = Path(__file__).parent
data_file = folder / "finallllll.csv"

app = Flask(__name__)

pages = {
    "league-detail.html",
    "mlb.html",
    "nba.html",
    "nfl.html",
    "premier-league.html",
    "uefa-champions-league.html",
}


def get_number(value):
    # Remove dollar signs and commas from the revenue.
    value = re.sub(r"[^0-9.]", "", str(value or ""))
    return float(value) if value else 0


def clean_text(value):
    return str(value or "").strip().lower()


def make_page_name(value):
    return re.sub(r"[^a-z0-9]+", "-", clean_text(value)).strip("-") + ".html"


def load_data():
    # Read every row from the CSV file.
    leagues = []
    with data_file.open(newline="", encoding="utf-8-sig") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            leagues.append({
                "id": row["League ID"],
                "name": row["Type"],
                "country": row["Country"],
                "sport": row["Sport"],
                "revenue": get_number(row["Revenue (USD)"]),
                "revenueLabel": f"${get_number(row['Revenue (USD)']) / 1_000_000_000:.2f}B",
                "leagueType": "Professional",
                "founded": int(row["Founded Year"]),
                "clubs": int(row["Total Teams"]),
                "detailPage": make_page_name(row["Type"]),
            })
    return leagues


league_data = load_data()


def get_visible_leagues(query="", sort_by="Revenue"):
    normalized_query = clean_text(query)
    visible_leagues = [
        league for league in league_data
        if not normalized_query or normalized_query in clean_text(" ".join(str(value) for value in league.values()))
    ]

    # Sort the rows selected by the user.
    if sort_by == "Lowest Revenue":
        visible_leagues.sort(key=lambda league: league["revenue"])
    elif sort_by == "League Name":
        visible_leagues.sort(key=lambda league: league["name"])
    elif sort_by == "Founded":
        visible_leagues.sort(key=lambda league: league["founded"])
    elif sort_by == "Clubs":
        visible_leagues.sort(key=lambda league: league["clubs"])
    else:
        visible_leagues.sort(key=lambda league: league["revenue"], reverse=True)
    return visible_leagues


@app.get("/")
@app.get("/index.html")
def home():
    query = request.args.get("q", "")
    sort_by = request.args.get("sort", "Revenue")
    visible_leagues = get_visible_leagues(query, sort_by)
    return render_template(
        "index.html",
        rows=visible_leagues,
        result_count=len(visible_leagues),
        total_leagues=len(league_data),
        current_sort=sort_by,
        search_query=query,
    )


@app.get("/<page_name>")
def league_page(page_name: str):
    if page_name not in pages and not page_name.endswith(".html"):
        abort(404)
    template_name = page_name if page_name in pages else "league-detail.html"
    return render_template(template_name)


if __name__ == "__main__":
    app.run(debug=True)
