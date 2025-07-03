#!/usr/bin/env python3
"""
Helper script to save the Projectmaven logo to the correct location.
"""

import os
import shutil
import sys
from pathlib import Path

def save_logo():
    """Save the uploaded logo to the assets directory."""
    
    # Create the assets directory if it doesn't exist
    assets_dir = Path("assets/logo")
    assets_dir.mkdir(parents=True, exist_ok=True)
    
    target_path = assets_dir / "projectmaven-logo.png"
    
    print("🎨 Projectmaven Logo Setup")
    print("=" * 40)
    print(f"Target location: {target_path}")
    print()
    
    # Check if logo already exists
    if target_path.exists():
        print(f"✅ Logo already exists at: {target_path}")
        return str(target_path)
    
    print("📋 To add your logo:")
    print("1. Drag and drop the uploaded Projectmaven logo file into this folder:")
    print(f"   {assets_dir.absolute()}")
    print("2. Rename it to: projectmaven-logo.png")
    print("3. Run: node scripts/process-logo.js")
    print()
    print("Alternatively, you can use this command if you have the logo in Downloads:")
    print(f"cp ~/Downloads/your-logo.png {target_path}")
    
    return None

if __name__ == "__main__":
    result = save_logo()
    if result:
        print(f"Logo ready at: {result}")
    else:
        print("Please add the logo file as instructed above.") 