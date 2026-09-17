import streamlit as st
import os

st.set_page_config(
    page_title="Hafiz Aiman — AI Developer",
    page_icon="icon.png",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Hide Streamlit UI elements for clean portfolio look
st.markdown("""
    <style>
        #MainMenu, footer, header {visibility: hidden;}
        .block-container {padding: 0; margin: 0;}
        iframe {border: none;}
    </style>
""", unsafe_allow_html=True)

# Load and serve the HTML file
html_path = os.path.join(os.path.dirname(__file__), "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

st.components.v1.html(html_content, height=900, scrolling=True)
