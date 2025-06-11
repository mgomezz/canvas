import xml.etree.ElementTree as ET
import urllib.request

def extract_rects_by_class(svg_file_path):
    tree = ET.parse(svg_file_path)
    root = tree.getroot()
    
    rects_data = {}
    
    for rect in root.findall('.//rect'):
        class_name = rect.get('class')
        if class_name in ['st2', 'st3']:
            rects_data[class_name] = {
                'x': float(rect.get('x')),
                'y': float(rect.get('y')),
                'width': float(rect.get('width')),
                'height': float(rect.get('height'))
            }
    
    return rects_data

def convert_to_meters(svg_units, scale_factor):
    """
    Convert SVG units to meters
    scale_factor: how many SVG units equal 1 meter
    """
    return svg_units / scale_factor

def download_svg_from_github():
    """Download the SVG file from your GitHub repository"""
    url = "https://raw.githubusercontent.com/mgomezz/canvas/main/assets/Pancartaconcuerdaencadaesquina-100x200.svg"
    local_filename = "Pancartaconcuerdaencadaesquina-100x200.svg"
    
    try:
        urllib.request.urlretrieve(url, local_filename)
        print(f"Downloaded SVG file as: {local_filename}")
        return local_filename
    except Exception as e:
        print(f"Error downloading file: {e}")
        return None

def main():
    # Download the SVG file
    svg_file = download_svg_from_github()
    
    if not svg_file:
        return
    
    try:
        # Extract rectangle data
        rects = extract_rects_by_class(svg_file)
        
        print("=== SVG Rectangle Data (Original Units) ===")
        for class_name, data in rects.items():
            print(f"\nRectangle '{class_name}':")
            print(f"  Width: {data['width']:.2f} SVG units")
            print(f"  Height: {data['height']:.2f} SVG units")
            print(f"  Area: {data['width'] * data['height']:,.2f} SVG units²")
        
        print("\n" + "="*50)
        print("CONVERSION TO METERS")
        print("="*50)
        
        # Common conversion scenarios
        conversion_options = {
            "1": {
                "name": "Points to Meters (1pt = 0.000352778m)",
                "factor": 1 / 0.000352778  # SVG units per meter
            },
            "2": {
                "name": "Pixels to Meters (96 DPI, 1px = 0.000264583m)",
                "factor": 1 / 0.000264583
            },
            "3": {
                "name": "Millimeters to Meters (1mm = 0.001m)",
                "factor": 1000  # 1000 mm per meter
            },
            "4": {
                "name": "Centimeters to Meters (1cm = 0.01m)",
                "factor": 100   # 100 cm per meter
            },
            "5": {
                "name": "Custom scale factor",
                "factor": None
            }
        }
        
        print("\nSelect conversion type:")
        for key, option in conversion_options.items():
            print(f"{key}. {option['name']}")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice in conversion_options:
            if choice == "5":
                try:
                    scale_factor = float(input("Enter scale factor (SVG units per meter): "))
                    conversion_name = f"Custom scale (1 meter = {scale_factor} SVG units)"
                except ValueError:
                    print("Invalid scale factor. Using default 1000 (mm to m)")
                    scale_factor = 1000
                    conversion_name = "Millimeters to Meters (default)"
            else:
                scale_factor = conversion_options[choice]["factor"]
                conversion_name = conversion_options[choice]["name"]
            
            print(f"\n=== CONVERTED TO METERS ({conversion_name}) ===")
            
            for class_name, data in rects.items():
                width_m = convert_to_meters(data['width'], scale_factor)
                height_m = convert_to_meters(data['height'], scale_factor)
                area_m2 = width_m * height_m
                
                print(f"\nRectangle '{class_name}':")
                print(f"  Width: {width_m:.6f} meters")
                print(f"  Height: {height_m:.6f} meters")
                print(f"  Area: {area_m2:.6f} m²")
                
                # Also show in more readable units if very small
                if width_m < 1:
                    print(f"  Width: {width_m * 1000:.3f} mm")
                    print(f"  Height: {height_m * 1000:.3f} mm")
                if area_m2 < 1:
                    print(f"  Area: {area_m2 * 1000000:.3f} mm²")
        else:
            print("Invalid choice. Please run the script again.")
            
    except Exception as e:
        print(f"Error processing SVG file: {e}")

if __name__ == "__main__":
    main()