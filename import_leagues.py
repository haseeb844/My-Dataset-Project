import re, json
from html import unescape
from pathlib import Path

source_path = Path('/Users/cashies/Downloads/Haseeb\'s Database.html')
text = source_path.read_text(encoding='utf-8')


def parse_table(table_name):
    pattern = re.compile(rf'<tr class="title"><td[^>]*>Table: {table_name}</td></tr>(.*?)(?:<tr class="title"><td[^>]*>|\Z)', re.S | re.I)
    match = pattern.search(text)
    chunk = match.group(1) if match else ''
    rows = []
    for tr in re.finditer(r'<tr[^>]*>(.*?)</tr>', chunk, flags=re.S | re.I):
        inner = tr.group(1)
        if 'class="title"' in inner or 'class="header"' in inner:
            continue
        cells = re.findall(r'<td[^>]*>(.*?)</td>', inner, flags=re.S | re.I)
        if not cells:
            continue
        cleaned = []
        for cell in cells:
            cell = re.sub(r'<[^>]+>', '', cell)
            cell = unescape(cell).strip()
            cleaned.append(cell)
        if cleaned and cleaned[0] != '#':
            rows.append(cleaned)
    return rows

sport_rows = parse_table('sport')
type_rows = parse_table('type')

def build_lookup(rows, value_index, name_index):
    lookup = {}
    for row in rows:
        if len(row) > max(value_index, name_index):
            lookup[str(row[value_index]).strip()] = str(row[name_index]).strip()
    return lookup

sport_lookup = build_lookup(sport_rows, 1, 2)
type_lookup = build_lookup(type_rows, 1, 2)

# parse the main league table
league_rows = parse_table('temp_database')
records = []
for row in league_rows:
    if len(row) < 13:
        continue
    league_id = row[1].strip()
    name = row[2].strip()
    country = row[3].strip()
    sport = sport_lookup.get(row[12].strip(), row[4].strip())
    revenue_num = float(row[5].replace(',', '').replace('$', '').replace(' ', '')) if row[5] else 0
    average_salary = float(row[6].replace(',', '').replace('$', '').replace(' ', '')) if row[6] else 0
    top_team = row[7].strip()
    clubs = int(row[8]) if row[8].strip().isdigit() else 0
    founded = int(row[9]) if row[9].strip().isdigit() else 0
    viewership = row[10].strip()
    league_type = type_lookup.get(row[11].strip(), row[2].strip() if len(row) > 2 else 'Professional')

    revenue_billions = revenue_num / 1_000_000_000
    if revenue_billions >= 1:
        revenue_label = f'${revenue_billions:.1f}B'
    else:
        revenue_label = f'${revenue_num/1_000_000:.0f}M'

    records.append({
        'leagueId': league_id,
        'name': name,
        'country': country,
        'revenue': revenue_num,
        'revenueLabel': revenue_label,
        'sport': sport,
        'leagueType': league_type,
        'founded': founded,
        'clubs': clubs,
        'topTeam': top_team,
        'averageSalary': average_salary,
        'viewership': viewership,
        'detailPage': f'league-detail.html?league={league_id}'
    })   'Information' inforrmation
    '

out_path = Path('/Users/cashies/Downloads/website/website/imported-leagues.js')
out_path.write_text('window.importedLeagueData = ' + json.dumps(records, indent=2) + ';\n', encoding='utf-8')
print(f'wrote {len(records)} records to {out_path}')
