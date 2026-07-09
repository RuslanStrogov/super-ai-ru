# 📋 Инфраструктурный план — Super AI RU

> Файл: `docs/plan/infrastructure.md`
> Статус: Черновик v1

---

## 1. Целевая инфраструктура (Production)

### 1.1 Yandex Cloud — основной провайдер

| Компонент | Сервис YC | Конфигурация | Оценка ₽/мес |
|-----------|-----------|-------------|-------------|
| **Kubernetes** | Managed K8s | 3 node × 8 vCPU, 32GB RAM | ~45 000 |
| **PostgreSQL** | Managed PostgreSQL | 2 × 4 vCPU, 16GB RAM, 200GB SSD | ~25 000 |
| **Redis** | Managed Redis | 2 × 2 vCPU, 8GB RAM | ~12 000 |
| **ClickHouse** | Managed ClickHouse | 2 × 4 vCPU, 16GB RAM, 500GB | ~20 000 |
| **Object Storage** | Object Storage (S3) | 1TB + CDN | ~3 000 |
| **GPU инстансы** | GPU (V100/A100) | 2 × A100 80GB (по требованию) | ~200 000 |
| **Qdrant** | Self-hosted в K8s | 2 × 4 vCPU, 16GB RAM | в K8s |
| **Load Balancer** | ALB | 2 штуки | ~7 000 |
| **Container Registry** | Yandex Container Registry | 50GB | ~1 500 |
| **Мониторинг** | Yandex Monitoring + Prometheus | — | ~5 000 |
| **Логи** | Yandex Logging + ELK self-hosted | 100GB/мес | ~8 000 |
| **Сеть** | VPC + NAT + DNS | — | ~3 500 |
| **Итого Production** | | | **~330 000 ₽/мес** |

### 1.2 Selectel — резервный провайдер (GPU)

| Компонент | Цена |
|-----------|------|
| GPU-сервер A100 80GB (1 шт.) | ~180 000 ₽/мес |
| GPU-сервер RTX 4090 (1 шт.) | ~65 000 ₽/мес |

### 1.3 Staging/Dev

| Компонент | Конфигурация | ₽/мес |
|-----------|-------------|-------|
| K8s Dev | 2 × 4 vCPU, 16GB RAM | ~15 000 |
| PostgreSQL Dev | 1 × 2 vCPU, 8GB RAM | ~5 000 |
| GPU Dev | 1 × RTX 4090 (Selectel) | ~65 000 |
| **Итого Dev** | | **~85 000 ₽/мес** |

---

## 2. Сетевая архитектура

```
                     Internet
                        |
                   [Cloudflare / YC ALB]
                        |
                   [API Gateway] (FastAPI)
                   /       |       \
                  /        |        \
           [Web App]   [RAG API]   [LLM Gateway]
           (Next.js)   (FastAPI)   (LiteLLM)
                |           |        /    |    \
           [Static]   [Qdrant]  [YandexGPT] [GigaChat] [vLLM]
           (S3/CDN)   (Vector DB)    |         |        (GPU)
                              [PostgreSQL]  [Redis Cache]
                                   |
                              [ClickHouse]
                              (логи/аналитика)
```

---

## 3. CI/CD Pipeline

### Инструменты: GitLab CI / GitHub Actions

```yaml
# Этапы:
1. lint → typecheck → unit tests
2. build → containerize (Docker)
3. push → Yandex Container Registry
4. deploy → Yandex Managed K8s (ArgoCD)
5. smoke tests → health check
6. (optional) canary → 10% трафика → 100%
```

### Окружения:
| Окружение | Цель | URL | GPU |
|-----------|------|-----|-----|
| `dev` | Разработчики | dev.super-ai.ru | RTX 4090 |
| `staging` | QA, тесты | staging.super-ai.ru | A100 |
| `production` | Пользователи | super-ai.ru | A100 × 2 |

---

## 4. GPU-планирование

### Варианты использования GPU:

| Задача | GPU | Кол-во | Часов/день | ₽/мес |
|--------|-----|--------|------------|-------|
| **LLM inference** (vLLM, 8B-70B) | A100 80GB | 1 | 24 | ~135 000 |
| **Fine-tuning** (LoRA, QLoRA) | A100 80GB | 1 | 8 (ночь) | ~45 000 |
| **Embeddings** (bge-m3, intfloat) | RTX 4090 | 1 | 24 | ~65 000 |
| **Staging inference** | A100 80GB | 1 | 12 | ~67 000 |
| **Dev / эксперименты** | RTX 4090 | 1 | 8 | ~27 000 |
| **Итого GPU** | | **4** | | **~340 000 ₽/мес** |

### Оптимизация GPU:
- vLLM → paged attention, continuous batching (экономия 40-60%)
- Flash Attention 2/3 → ускорение 2x
- DeepSpeed ZeRO → для fine-tuning
- LoRA/QLoRA → дообучение на одном A100
- GPU Spot-инстансы → скидка 60% (но могут выключаться)

---

## 5. Базы данных

| База | Назначение | Размер | Шардинг |
|------|-----------|--------|---------|
| **PostgreSQL** | Пользователи, подписки, история чатов, метаданные | 50-200 GB | pg_partman (по дате) |
| **Qdrant** | Векторные эмбеддинги для RAG | 10-100 GB | По коллекциям |
| **Redis** | Сессии, кэш LLM-ответов, rate limiter | 4-8 GB | Redis Cluster |
| **ClickHouse** | Логи, телеметрия, аналитика использования | 200-500 GB | По месяцам |
| **S3** | Документы пользователей, модели, артефакты | 0.5-2 TB | — |

---

## 6. Безопасность (Enterprise-ready)

| Компонент | Решение |
|-----------|---------|
| **Auth** | Keycloak (SSO, OAuth2, SAML, LDAP) |
| **RBAC** | Кастомная + Keycloak roles |
| **API Security** | JWT + API Keys + rate limiting (Redis) |
| **Data at rest** | AES-256 (Yandex KMS) |
| **Data in transit** | TLS 1.3 (все сервисы) |
| **Secrets** | Yandex Lockbox / HashiCorp Vault |
| **Audit** | Все действия → ClickHouse |
| **DPA** | ФЗ-152, 152-ФЗ compliance |
| **Network** | VPC, private subnets, NAT, security groups |
| **WAF** | Cloudflare WAF / Yandex WAF |

---

## 7. Мониторинг и Observability

| Слой | Инструмент | Что отслеживаем |
|------|-----------|-----------------|
| **Metrics** | Prometheus + Grafana | CPU, RAM, GPU, latency, RPS, errors |
| **Logs** | ELK (Elasticsearch + Kibana) / Yandex Logging | Все логи сервисов |
| **Traces** | Jaeger / OpenTelemetry | Distributed tracing |
| **Alerts** | AlertManager + Telegram | Падения, latency > 1s, 5xx > 1% |
| **Uptime** | UptimeRobot / BetterStack | Внешний мониторинг |

### Ключевые метрики (SLI/SLO):
| Метрика | SLO | Триггер алерта |
|---------|-----|----------------|
| LLM response time (p95) | < 3s | > 5s |
| API availability | 99.9% | < 99.5% |
| RAG retrieval time | < 500ms | > 1s |
| Error rate (5xx) | < 0.5% | > 1% |
| GPU utilization | > 70% | < 30% или > 95% |

---

## 8. Бэкапы и DR

| Данные | Частота | Retention | RPO | RTO |
|--------|---------|-----------|-----|-----|
| PostgreSQL | Ежечасно + WAL | 30 дней | 1 час | 1 час |
| Qdrant (snapshot) | Ежедневно | 14 дней | 1 день | 2 часа |
| S3 документы | Cross-region replication | 90 дней | 15 мин | 1 час |
| ClickHouse | Ежедневно | 30 дней | 1 день | 2 часа |
| K8s manifests | Git (GitOps) | Вечность | — | 30 мин |

---

## 9. Этапы разворачивания инфраструктуры

### Phase 0 — Foundation (1-2 недели)
- [ ] Аккаунт Yandex Cloud + бюджет
- [ ] Terraform: VPC, K8s, PostgreSQL, Redis, S3
- [ ] GitLab CI / GitHub Actions + Container Registry
- [ ] Keycloak setup
- [ ] Весь Dev окружение

### Phase 1 — MVP (2-4 недели)
- [ ] API Gateway (FastAPI) + K8s deployment
- [ ] LiteLLM setup (прокси ко всем LLM)
- [ ] PostgreSQL schema + миграции
- [ ] Qdrant cluster
- [ ] Staging окружение
- [ ] Мониторинг (Prometheus + Grafana)
- [ ] Основной CI/CD pipeline

### Phase 2 — Production Ready (2-3 недели)
- [ ] Production K8s cluster + GPU node pool
- [ ] vLLM deployment (open-source LLM)
- [ ] Auto-scaling (HPA + Cluster Autoscaler)
- [ ] WAF + DDoS protection
- [ ] Backup automation
- [ ] Load testing (k6/Yandex Tank)

### Phase 3 — Scale (постоянно)
- [ ] Multi-region (Yandex + Selectel)
- [ ] Spot GPU инстансы
- [ ] CDN для моделей
- [ ] Enterprise on-premise installer