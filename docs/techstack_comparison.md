# Сравнение технологических стеков: Abacus.AI и конкуренты

## Abacus.AI (abacus.ai)

| Категория | Технологии |
|---|---|
| **Языки программирования** | **Python** (основной — API клиент, исследовательский код, обучение моделей), TypeScript/JavaScript (фронтенд, DeepAgent desktop), Rust (возможно, в компонентах инференса), Go (вероятно, в инфраструктурных компонентах) |
| **ML фреймворки** | **PyTorch** (основной — Smaug, Long-Context, ForecastPFN), HuggingFace Transformers, **vLLM** (сервинг LLM), **SGLang** (сервинг), Flash Attention, XFormers, DPOP (собственный метод обучения) |
| **Инфраструктура** | **Docker** (gh200-llm образ), **NVIDIA GPU** (GH200, H100), **InfiniBand**, **Ray** (распределённые вычисления), Lambda Labs, GitHub Container Registry (ghcr.io), AWS (предположительно), Kubernetes |
| **Базы данных** | Информация не раскрыта публично; вероятно PostgreSQL, Redis (кеширование) |
| **Фронтенд** | **React** / TypeScript, вероятно Next.js; Abacus AI Desktop (Electron-based desktop-приложение для AI-ассистента) |
| **MLOps компоненты** | vLLM (сервинг), HuggingFace Trainer (обучение), собственные пайплайны обучения и инференса, Sphinx (документация) |
| **Open Source вклад** | **Smaug-72B-v0.1** (первая open-source модель с >80% на Open LLM Leaderboard), **Long-Context** (расширение контекста LLM, 601★), **ForecastPFN** (zero-shot forecasting, 85★), **XAI-Bench** (объяснимость, 72★), **gh200-llm** (Docker для NVIDIA GH200, 56★), **api-python** (клиент API, 28★) |
| **Модели/Продукты** | ChatLLM (для профессионалов), Abacus.AI Enterprise (для организаций), DeepAgent (AI-агент), Abacus AI Studio (генерация изображений), AI Agent Swarm |

---

## Сравнительная таблица конкурентов

### 1. DataRobot (datarobot.com)

| Категория | Технологии |
|---|---|
| **Языки** | **Python** (основной), **Java** (ядро платформы), **R** |
| **ML фреймворки** | Собственный AutoML-движок, scikit-learn, XGBoost, LightGBM, TensorFlow, PyTorch, H2O |
| **Инфраструктура** | **AWS** (основной), Azure, GCP, Kubernetes, Docker, **NVIDIA GPU** |
| **Базы данных** | PostgreSQL, Snowflake, Google BigQuery, Amazon Redshift |
| **Фронтенд** | React + TypeScript |
| **MLOps** | DataRobot AI Governance, AI Observability, AI Apps & Agents, batch-scoring, MLOps pipelines, Airflow (airflow-provider-datarobot) |
| **Open Source** | syftr (агентный оптимизатор, 344★), datarobot-user-models, pic2vec, Covalent |

### 2. H2O.ai (h2o.ai)

| Категория | Технологии |
|---|---|
| **Языки** | **Java** (ядро H2O-3), **Python**, **R** |
| **ML фреймворки** | **H2O-3** (собственный Java ML engine), XGBoost, LightGBM, TensorFlow, scikit-learn, Spark MLlib |
| **Инфраструктура** | **H2O AI Cloud** (Kubernetes), AWS, GCP, Azure, NVIDIA GPU, Apache Spark (Sparkling Water) |
| **Базы данных** | PostgreSQL, Snowflake, различные SQL/NoSQL через коннекторы |
| **Фронтенд** | **H2O Wave** (собственный reactive framework для Python/R), React |
| **MLOps** | H2O Driverless AI (AutoML), H2O LLM Studio (no-code fine-tuning), Enterprise h2oGPTe, H2O Feature Store, Sparkling Water, Document AI |
| **Open Source** | **H2O-3** (7.5k★), **H2O Wave** (4.2k★), **datatable** (1.9k★), **Sparkling Water** (978★), **h2oGPT**, **h2o-llmstudio** |

### 3. Google Vertex AI / Gemini Enterprise Agent Platform (cloud.google.com)

| Категория | Технологии |
|---|---|
| **Языки** | **Python** (основной для ML), **JavaScript/TypeScript**, **Go**, **Java** |
| **ML фреймворки** | **TensorFlow**, **JAX**, **PyTorch** (через Training), scikit-learn, XGBoost, Gemini модели, Claude Model Family, Gemma |
| **Инфраструктура** | **Google Cloud (GCP)**, **Kubernetes (GKE)**, **TPU/GPU**, BigQuery, Cloud Storage |
| **Базы данных** | **BigQuery**, Cloud SQL (PostgreSQL/MySQL), Spanner, Firestore, AlloyDB, Vertex AI Feature Store |
| **Фронтенд** | Angular (Google Cloud Console), React (Model Garden UI) |
| **MLOps** | Vertex AI Pipelines, Model Garden (200+ моделей), Model Registry, AutoML, Feature Store, AI Platform Notebooks (Colab Enterprise, Workbench), Model Evaluation, ML Metadata |
| **Open Source** | **TensorFlow**, **Kubeflow**, **JAX**, Flax, Gemma, MediaPipe — огромный вклад в экосистему |

### 4. AWS SageMaker (aws.amazon.com/sagemaker)

| Категория | Технологии |
|---|---|
| **Языки** | **Python** (основной SDK), **R**, **Java**, **JavaScript** |
| **ML фреймворки** | **Любой через Docker**: PyTorch, TensorFlow, MXNet, scikit-learn, XGBoost, HuggingFace, JAX |
| **Инфраструктура** | **AWS** (EC2, EKS, ECS), Docker, **NVIDIA GPU**, **AWS Trainium/Inferentia**, SageMaker HyperPod |
| **Базы данных** | Amazon **S3** (основное хранилище данных), Redshift, DynamoDB, RDS, Athena, SageMaker Feature Store |
| **Фронтенд** | React + TypeScript (AWS Console), SageMaker Studio (JupyterLab-based IDE) |
| **MLOps** | SageMaker Pipelines, Model Registry, Feature Store, Model Monitor (дрейф данных), Clarify (bias/объяснимость), Debugger, Autopilot (AutoML), Canvas (no-code ML), JumpStart (pre-built модели) |
| **Open Source** | SageMaker Python SDK, Docker контейнеры (~100 образов), JumpStart модельные карты, большая документация |

### 5. MLflow (mlflow.org)

| Категория | Технологии |
|---|---|
| **Языки** | **Python** (основной), **R**, **Java**, **JavaScript** |
| **ML фреймворки** | **Framework-agnostic**: PyTorch, TensorFlow, scikit-learn, XGBoost, LightGBM, HuggingFace, OpenAI, и любой другой |
| **Инфраструктура** | Работает на любом облаке (AWS/GCP/Azure/on-prem), Docker, Kubernetes (через MLflow Projects), Databricks |
| **Базы данных** | PostgreSQL, MySQL, SQLite, MSSQL (backend store); S3, GCS, Azure Blob (artifact store) |
| **Фронтенд** | **React** + JavaScript (MLflow Tracking UI) |
| **MLOps** | **Experiment Tracking**, **Model Registry**, MLflow Pipelines, MLflow Projects, Model Serving (собственный и через pyfunc/MLServer), MLflow Evaluate, Tracing для LLM, LangChain/OpenAI интеграции |
| **Open Source** | **Полностью open-source** (26.9k★ на GitHub), Apache 2.0, поддерживается Databricks, де-факто стандарт MLOps |

---

## Сводная таблица по всем категориям

| Категория | Abacus.AI | DataRobot | H2O.ai | Vertex AI | SageMaker | MLflow |
|---|---|---|---|---|---|---|
| **Языки** | Python, TS/JS | Python, Java, R | Java, Python, R | Python, JS, Go, Java | Python, R, Java, JS | Python, R, Java, JS |
| **ML фреймворки** | PyTorch, HF, vLLM | Собственный, sklearn, XGBoost | H2O-3, sklearn, XGBoost | TF, JAX, PyTorch, Gemini | Любой (Docker) | Любой (agnostic) |
| **Инфраструктура** | AWS, Docker, GPU (NVIDIA), Ray | AWS, K8s, Docker, GPU | K8s (H2O AI Cloud), GPU, Spark | GCP, GKE, TPU/GPU | AWS, Docker, Trainium/GPU | Любая (agnostic) |
| **БД** | (не раскрыто) | PG, Snowflake, BigQuery, Redshift | PG, Snowflake | BigQuery, Spanner, AlloyDB | S3, Redshift, DynamoDB | PG/MySQL/SQLite + S3/GCS |
| **Фронтенд** | React/TS, Desktop | React/TS | H2O Wave, React | Angular, React | React, SageMaker Studio | React |
| **MLOps** | vLLM, HF Trainer | Airflow, Governance, Observability | Driverless AI, LLM Studio | Pipelines, Model Garden | Pipelines, Monitor, Clarify | Tracking, Registry, Serving |
| **Open Source** | Smaug, Long-Context, ForecastPFN | syftr, pic2vec | H2O-3 (7.5k★), Wave (4.2k★) | TF, Kubeflow, JAX | SageMaker SDK | **26.9k★** |

---

## Ключевые выводы

1. **Abacus.AI** — молодая AI-first компания, фокусирующаяся на **генеративном AI** и **агентных системах**. Их стек: Python + PyTorch + NVIDIA GPU. Открыли Smaug (первую open-source модель >80% на Open LLM Leaderboard). В отличие от конкурентов, не раскрывают детали инфраструктуры и БД.

2. **DataRobot** — зрелая платформа автоматизированного ML (AutoML) с сильным фокусом на **Java/Python** и собственный AutoML-движок. Интегрируется с Airflow, предлагает мощные инструменты governance.

3. **H2O.ai** — лидер open-source ML (H2O-3 — 7.5k★). Уникален тем, что ядро написано на **Java** (масштабируемость), при этом предоставляет первоклассную поддержку Python и R.

4. **Google Vertex AI** — гигант cloud ML с интеграцией **TPU** и **JAX/TensorFlow**. Поддерживает 200+ моделей через Model Garden. Сильнейшая сторона — интеграция с BigQuery и экосистема GCP.

5. **AWS SageMaker** — самый гибкий cloud ML сервис (поддерживает любой фреймворк через Docker). Уникален собственными чипами Trainium/Inferentia и мощными инструментами мониторинга (Model Monitor, Clarify).

6. **MLflow** — **не конкурент, а стандарт**. Полностью open-source (26.9k★), framework-agnostic, де-факто стандарт MLOps для experiment tracking и model registry. Часто используется **вместе с** Abacus.AI, DataRobot, H2O.ai, Vertex AI и SageMaker.