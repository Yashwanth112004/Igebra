
import os
import requests
from flask import Flask, request, jsonify, render_template, send_file
from dotenv import load_dotenv
from fpdf import FPDF
from typing import Dict, List, Optional
import re
import codecs

# Initialize the Flask app
app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
HF_TOKEN = os.getenv("HF_ACCESS_TOKEN")

if not API_KEY or not HF_TOKEN:
    raise ValueError("Please set GEMINI_API_KEY and HF_ACCESS_TOKEN in the .env file.")

# Ensure output directories exist
os.makedirs("generated_images", exist_ok=True)

class EducationalComicGenerator:
    def __init__(self, api_key: str, hf_token: str):
        """Initialize the generator with API key and Hugging Face token."""
        self.hf_token = hf_token
        
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-exp-1206")

    def create_comic_prompt(self, answers: Dict[str, str]) -> str:
        """Creates a structured prompt for educational comic script based on user's answers."""
        return (
            f"You are an expert educational comic creator. Based on the following information, generate a detailed, "
            f"engaging comic script for kids about {answers.get('topic', '')}:\n\n"
            f"Topic: {answers.get('topic', '')}\n"
            f"Target Audience: {answers.get('target_audience', '')}\n"
            f"Objective: {answers.get('objective', '')}\n\n"
            "Generate a script for a 4-panel comic that explains the topic in a fun and educational way. Include dialogue, "
            "educational content, and narrative structure for each panel. Keep the tone friendly, clear, and entertaining.\n\n"
            "The script should include:\n"
            "1. Panel 1: Introduction to the topic with an engaging hook.\n"
            "2. Panel 2: Explanation with examples or visuals.\n"
            "3. Panel 3: A challenge or problem related to the topic.\n"
            "4. Panel 4: Resolution and conclusion with a fun takeaway or learning point."
        )

    def generate_comic_script(self, user_answers: Dict[str, str]) -> Optional[str]:
        """Generates an educational comic script using the Gemini API."""
        try:
            prompt = self.create_comic_prompt(user_answers)
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating comic script: {e}")
            return None

    def generate_image_prompts(self, script: str) -> List[str]:
        """Generate image prompts based on the first 4 panel lines."""
        panels = script.split("\n\n")[:4]  # Take only the first 4 panels
        return [f"Comic panel {i + 1}: {panel}" for i, panel in enumerate(panels)]

    def generate_images(self, prompts: List[str]) -> List[str]:
        """Generate images using Hugging Face API."""
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        image_paths = []

        for i, prompt in enumerate(prompts, start=1):
            url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2"
            payload = {"inputs": prompt}
            try:
                response = requests.post(url, headers=headers, json=payload)
                response.raise_for_status()
                image_path = f"generated_images/panel_{i}.png"
                with open(image_path, "wb") as f:
                    f.write(response.content)
                image_paths.append(image_path)
            except requests.RequestException as e:
                print(f"Error generating image for prompt {i}: {e}")

        return image_paths

    @staticmethod
    

    def save_comic_pdf(script: str, image_paths: List[str], filename: str) -> bool:
        """
        Saves the comic script and optional images to a formatted PDF file.

        Args:
            script (str): The comic script text.
            image_paths (List[str]): A list of image paths corresponding to the panels.
            filename (str): The name of the output PDF file.

        Returns:
            bool: True if the PDF was successfully created, False otherwise.
        """
        try:
            script = re.sub(r'[\#\*\*]+', '', script)
            script = script.encode('latin-1', 'replace').decode('latin-1')  
            pdf = FPDF()
            pdf.set_auto_page_break(auto=True, margin=15)
            pdf.add_page()
            pdf.set_font("Arial", "B", 16)

            # Add the comic title
            pdf.cell(0, 10, "Educational Comic Script", ln=True, align="C")
            pdf.ln(10)

            # Split the script into panels
            panels = script.split("\n")

            # Loop through each panel and add its content
            for i, panel_text in enumerate(panels, start=1):
                pdf.set_font("Arial", "B", 14)
                pdf.ln(1)

                # Add panel text
                pdf.set_font("Arial", "", 12)
                for line in panel_text.split("\n"):
                    pdf.multi_cell(0, 10, line.strip())
                pdf.ln(5)

                # Add the corresponding image if available
                if i <= len(image_paths):
                    image_path = image_paths[i - 1]
                    try:
                        pdf.image(image_path, x=30, w=150)
                        pdf.ln(10)
                    except Exception as e:
                        print(f"Error adding image for Panel {i}: {e}")
                        pdf.set_font("Arial", "I", 12)
                        pdf.cell(0, 10, "(Image could not be loaded.)", ln=True)
                        pdf.ln(5)

            # Save the PDF
            pdf.output(filename)
            print(f"PDF saved to {filename}")
            return True
        except Exception as e:
            print(f"Error creating PDF: {e}")
            return False


# Initialize comic generator
comic_generator = EducationalComicGenerator(API_KEY, HF_TOKEN)

@app.route("/")
def index():
    """Serve the HTML form."""
    return render_template("Comic.html")

@app.route("/generate_comic", methods=["POST"])
def generate_comic():
    """Handle comic generation requests."""
    try:
        data = request.json
        user_answers = {
            "topic": data["topic"],
            "target_audience": data["target_audience"],
            "objective": data["objective"],
        }

        # Generate script
        script = comic_generator.generate_comic_script(user_answers)
        if not script:
            return jsonify({"error": "Failed to generate script."}), 500

        # Generate images
        image_prompts = comic_generator.generate_image_prompts(script)
        image_paths = comic_generator.generate_images(image_prompts)

        # Save PDF
        filename = "comic_script.pdf"
        if comic_generator.save_comic_pdf(script, image_paths, filename):
            return jsonify({
                "script": script,
                "pdf_url": f"/download/{filename}",
                "images": [f"/download/{os.path.basename(path)}" for path in image_paths],
            })
        return jsonify({"error": "Failed to save PDF."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download/<filename>")
def download_file(filename):
    """Handle file download requests."""
    try:
        folder = "generated_images" if filename.endswith(".png") else ""
        return send_file(os.path.join(folder, filename), as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
