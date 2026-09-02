import re

with open("src/pages/CheckoutPage.jsx", "rb") as f:
    raw = f.read()

# Try to decode - the file is mangled, attempt latin-1 first
try:
    text = raw.decode("utf-8")
except:
    text = raw.decode("latin-1")

# Replace all known broken sequences with correct Unicode
replacements = [
    # Various encodings of rupee ₹
    ("Ã¢âÂ¹", "₹"),
    ("â‚¹", "₹"),
    # Various encodings of em dash —
    ("Ã¢â¬â", "—"),
    ("â€"", "—"),
    # Various encodings of checkmark ✓
    ("Ã¢Åâ", "✓"),
    ("âœ"", "✓"),
    # Various encodings of ⚠️
    ("â ï¸Â", "⚠️"),
    ("â ï¸", "⚠️"),
    ("âš ï¸", "⚠️"),
    # replacement char
    ("ï¿½", "-"),
]

for broken, fixed in replacements:
    text = text.replace(broken, fixed)

with open("src/pages/CheckoutPage.jsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Done")
# verify
remaining = [c for c in ["â‚¹","â€","âœ","Ã¢"] if c in text]
print("Remaining broken:", remaining if remaining else "None")
