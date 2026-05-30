import os
from PIL import Image, ImageDraw, ImageOps

def add_rounded_corners_and_border(img, radius, border_width, border_color):
    # Resize with antialiasing
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    # Draw rounded rect mask
    draw.rounded_rectangle([0, 0, img.size[0], img.size[1]], radius, fill=255)
    
    # Apply rounded corners mask
    rounded_img = ImageOps.fit(img, img.size, centering=(0.5, 0.5))
    rounded_img.putalpha(mask)
    
    # Draw border on a new RGBA canvas
    bordered = Image.new('RGBA', img.size, (0, 0, 0, 0))
    bordered.paste(rounded_img, (0, 0))
    
    draw_border = ImageDraw.Draw(bordered)
    draw_border.rounded_rectangle(
        [border_width//2, border_width//2, img.size[0] - border_width//2, img.size[1] - border_width//2],
        radius,
        outline=border_color,
        width=border_width
    )
    return bordered

def create_collage():
    print("Generating screens collage...")
    # Widescreen canvas dimensions
    canvas_w = 1920
    canvas_h = 1080
    
    # Base dark background
    canvas = Image.new('RGBA', (canvas_w, canvas_h), (11, 15, 25, 255))
    
    # Load screenshots
    screens_dir = 'temp_screenshots'
    files = ['dashboard.png', 'chatbot.png', 'speed_alert.png', 'accident_report.png']
    
    # Setup coordinates for 4 screens in a staggered layout
    # Width of each screen will be 380, height 770
    screen_w = 380
    screen_h = 770
    
    x_offset = 100
    gap = 60
    y_positions = [180, 100, 180, 100] # Staggered vertical offsets
    
    border_color = (38, 50, 77, 255) # Sleek grey card border
    border_width = 8
    corner_radius = 24
    
    for idx, filename in enumerate(files):
        path = os.path.join(screens_dir, filename)
        if not os.path.exists(path):
            print(f"Error: {path} not found. Capture screenshots first.")
            return
            
        img = Image.open(path).convert('RGBA')
        # Resize to collage dimensions
        resized_img = img.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
        
        # Apply rounded corners & premium phone-like border
        styled_img = add_rounded_corners_and_border(resized_img, corner_radius, border_width, border_color)
        
        # Calculate x coordinate
        x_pos = x_offset + idx * (screen_w + gap)
        y_pos = y_positions[idx]
        
        # Paste onto canvas
        canvas.alpha_composite(styled_img, (x_pos, y_pos))
        print(f"Pasted styled {filename} onto collage.")

    output_path = 'public/features_collage.png'
    # Convert RGBA to RGB for saving as PNG
    final_rgb = Image.new('RGB', (canvas_w, canvas_h), (11, 15, 25))
    final_rgb.paste(canvas, mask=canvas.split()[3]) # Use alpha channel as mask
    final_rgb.save(output_path, 'PNG')
    print(f"Collage successfully saved as {output_path}")

if __name__ == "__main__":
    create_collage()
