# Projet-Integration

# NOTES 1 :

## Commandes

### Développement (membres backend/frontend)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Développement (chef AI)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.ai.yml up --build
```

### Production
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

### Reset complet
```bash
docker compose down --remove-orphans -v
```

---

## Services & Ports

| Service  | Dev          | Prod   |
|----------|--------------|--------|
| Backend  | :4001        | :4001  |
| Frontend | :5173        | :80    |
| Database | :5433        | :5432  |
| AI       | :8000        | :8000  |

---

## AI Service

### Dépendances séparées

| Fichier                  | Contenu                          | Utilisé par       |
|--------------------------|----------------------------------|-------------------|
| `requirements.dev.txt`  | une partie des dependances      | tous les membres  |
| `requirements.ai.txt`    | tous les dependances      | chef AI seulement |

### Stages Dockerfile AI

| Stage          | Dépendances         | Commande                    |
|----------------|---------------------|-----------------------------|
| development    | requirements.dev   | membres normaux             |
| development-ai | requirements.ai     | chef AI (docker-compose.ai.yml) |
| production     | requirements.dev     | prod                        |

