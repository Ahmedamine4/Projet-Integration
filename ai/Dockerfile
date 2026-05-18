FROM python:3.11-slim AS base
WORKDIR /app

# Dev: docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
FROM base AS development
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y patchelf && apt-get clean
RUN find /usr/local/lib -name "onnxruntime_pybind11_state*.so" \
    -exec patchelf --clear-execstack {} \;
COPY scripts ./scripts
COPY models ./models
COPY data ./data
# download the models at build time because they are large and we don't want to download them every time the container starts
RUN bash scripts/download_models.sh 
EXPOSE 8000
<<<<<<< HEAD
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.dev.txt
COPY scripts ./scripts
=======
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
CMD ["uvicorn", "scripts.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Prod: docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
FROM base AS production
<<<<<<< HEAD
COPY requirements.prod.txt .
EXPOSE 8000
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.prod.txt
    #changement du fichier car l'image du prod doit etre plus legere que dev !
COPY scripts ./scripts
# COPY src ./src : pas de dossier src!
=======
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# only copy what the API actually needs at runtime
COPY scripts/main.py        ./scripts/main.py
COPY scripts/inference.py   ./scripts/inference.py
COPY scripts/normalise.py   ./scripts/normalise.py
COPY scripts/__init__.py    ./scripts/__init__.py
COPY scripts/download_models.sh ./scripts/download_models.sh
COPY models ./models
COPY data ./data
RUN bash scripts/download_models.sh
EXPOSE 8000
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
CMD ["uvicorn", "scripts.main:app", "--host", "0.0.0.0", "--port", "8000"]