# Trained DistilBERT UGC NER v4 Model Directory

This directory holds the fine-tuned Hugging Face DistilBERT model files for Named Entity Recognition (NER) trained on UGC/AICTE regulatory compliance documents.

## Expected Files in this Directory

* `config.json` - Model configuration file
* `model.safetensors` or `pytorch_model.bin` - Model weights
* `tokenizer.json` / `tokenizer_config.json` - Tokenizer config
* `vocab.txt` - DistilBERT vocabulary

## Loading Model Path

The Python AI service inspects the following paths in order of precedence:
1. Environment Variable `NER_MODEL_PATH` (e.g. `/content/drive/MyDrive/ugc_ai_training/models/distilbert_ugc_ner_v4`)
2. Local Project Directory (`./models/distilbert_ugc_ner_v4`)
3. Pretrained Hugging Face transformer fallback (`distilbert-base-uncased` fine-tuning wrapper)

You can run `python setup_model.py` to copy weights directly from Google Drive or custom paths to this directory.
