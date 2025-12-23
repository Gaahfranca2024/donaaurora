
import sys
import argparse
from kerykeion import AstrologicalSubjectFactory, ChartDataFactory, ChartDrawer

def generate_chart(name, year, month, day, hour, minute, city, lat, lon):
    try:
        # Create Subject (Offline mode as we have coords)
        subject = AstrologicalSubjectFactory.from_birth_data(
            name=name,
            year=int(year),
            month=int(month),
            day=int(day),
            hour=int(hour),
            minute=int(minute),
            lng=float(lon),
            lat=float(lat),
            tz_str="America/Sao_Paulo", # Defaulting to BRT for now as per user context
            online=False
        )

        # Generate Chart Data
        chart_data = ChartDataFactory.create_natal_chart_data(subject)

        # Draw Chart (Dark Theme for "Galaxy" look)
        drawer = ChartDrawer(
            chart_data=chart_data,
            theme="dark", 
            chart_language="PT"
        )

        # Output SVG
        print(drawer.generate_svg_string())

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate Astral Chart SVG')
    parser.add_argument('name', type=str)
    parser.add_argument('year', type=int)
    parser.add_argument('month', type=int)
    parser.add_argument('day', type=int)
    parser.add_argument('hour', type=int)
    parser.add_argument('minute', type=int)
    parser.add_argument('city', type=str)
    parser.add_argument('lat', type=float)
    parser.add_argument('lon', type=float)

    args = parser.parse_args()

    generate_chart(
        args.name, args.year, args.month, args.day, 
        args.hour, args.minute, args.city, args.lat, args.lon
    )
