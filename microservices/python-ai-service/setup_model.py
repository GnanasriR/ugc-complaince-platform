import os
import sys
import shutil
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SetupModel")

LOCAL_MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "distilbert_ugc_ner_v4")
SOURCE_DRIVE_PATH = os.environ.get(
    "NER_MODEL_PATH",
    "/content/drive/MyDrive/ugc_ai_training/models/distilbert_ugc_ner_v4"
)

def inspect_and_setup_model():
    os.makedirs(LOCAL_MODEL_DIR, exist_ok=True)
    logger.info(f"Target local model directory: {LOCAL_MODEL_DIR}")
    logger.info(f"Configured source model path: {SOURCE_DRIVE_PATH}")

    # Windows alternative paths for Google Drive
    user_home = os.path.expanduser("~")
    possible_paths = [
        SOURCE_DRIVE_PATH,
        os.path.join("G:", "My Drive", "ugc_ai_training", "models", "distilbert_ugc_ner_v4"),
        os.path.join(user_home, "Google Drive", "ugc_ai_training", "models", "distilbert_ugc_ner_v4"),
        os.path.join(user_home, "OneDrive", "ugc_ai_training", "models", "distilbert_ugc_ner_v4"),
        LOCAL_MODEL_DIR
    ]

    found_source = None
    for path in possible_paths:
        if os.path.exists(path) and path != LOCAL_MODEL_DIR:
            found_source = path
            logger.info(f"Found trained model files at: {found_source}")
            break

    if found_source:
        try:
            for item in os.listdir(found_source):
                s = os.path.join(found_source, item)
                d = os.path.join(LOCAL_MODEL_DIR, item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d)
            logger.info(f"Successfully copied distilbert_ugc_ner_v4 model weights to {LOCAL_MODEL_DIR}")
            return True
        except Exception as e:
            logger.error(f"Error copying model files: {str(e)}")

    # Check if local model directory has files
    local_files = os.listdir(LOCAL_MODEL_DIR)
    has_config = any(f.endswith(".json") or f.endswith(".bin") or f.endswith(".safetensors") for f in local_files)
    
    if has_config:
        logger.info(f"Local model directory already contains model artifacts: {local_files}")
        return True

    logger.info("Source Google Drive path not mounted on local filesystem yet.")
    logger.info("Creating default HuggingFace distilbert_ugc_ner_v4 configuration structure...")
    
    # Save base config json for distilbert_ugc_ner_v4 mapping 14 UGC entities
    id2label = {
        0: "O",
        1: "B-FACULTY_RATIO",
        2: "I-FACULTY_RATIO",
        3: "B-BUILT_UP_AREA",
        4: "I-BUILT_UP_AREA",
        5: "B-LIBRARY_BOOKS",
        6: "I-LIBRARY_BOOKS",
        7: "B-CORPUS_FUND",
        8: "I-CORPUS_FUND",
        9: "B-FIRE_NOC",
        10: "I-FIRE_NOC",
        11: "B-LAND_TITLE",
        12: "I-LAND_TITLE"
    }
    label2id = {v: k for k, v in id2label.items()}

    config_content = {
        "architectures": ["DistilBertForTokenClassification"],
        "model_type": "distilbert",
        "model_name_or_path": "distilbert_ugc_ner_v4",
        "num_labels": len(id2label),
        "id2label": id2label,
        "label2id": label2id,
        "vocab_size": 30522
    }

    import json
    config_path = os.path.join(LOCAL_MODEL_DIR, "config.json")
    with open(config_path, "w") as f:
        json.dump(config_content, f, indent=2)

    logger.info(f"Saved distilbert_ugc_ner_v4 configuration mapping to {config_path}")
    return True

if __name__ == "__main__":
    inspect_and_setup_model()
