import streamlit as st
import os
import base64

st.set_page_config(
    page_title="Hafiz Aiman — AI Developer",
    page_icon="icon.png",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown("""
    <style>
        #MainMenu, footer, header, [data-testid="stToolbar"] {visibility: hidden;}
        .block-container {padding: 0; margin: 0; max-width: 100%;}
        iframe {border: none; overflow: visible !important;}
    </style>
""", unsafe_allow_html=True)

base_dir = os.path.dirname(os.path.abspath(__file__))

# Read index.html
with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    html = f.read()

# Read and inline CSS
with open(os.path.join(base_dir, "assets", "css", "style.css"), "r", encoding="utf-8") as f:
    css = f.read()
html = html.replace(
    '<link rel="stylesheet" href="assets/css/style.css" />',
    f"<style>{css}</style>"
)

# Read and inline JS
for js_file in ["script.js", "chatbot.js"]:
    with open(os.path.join(base_dir, "assets", "js", js_file), "r", encoding="utf-8") as f:
        js = f.read()
    html = html.replace(
        f'<script src="assets/js/{js_file}" defer></script>',
        f"<script>{js}</script>"
    )

# Convert images to base64
def img_to_base64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

img_path = os.path.join(base_dir, "assets", "images", "photo_2026-04-07_20-23-45.jpg")
if os.path.exists(img_path):
    b64 = img_to_base64(img_path)
    html = html.replace(
        'src="assets/images/photo_2026-04-07_20-23-45.jpg"',
        f'src="data:image/jpeg;base64,{b64}"'
    )

# Fix: ensure nav dropdown is not clipped by iframe overflow
html = html.replace(
    '<body>',
    '<body><style>.site-nav.is-open{overflow:visible !important;} .site-header{overflow:visible !important;} html,body{overflow-x:hidden !important;}</style>'
)

st.iframe(html, height=800)
