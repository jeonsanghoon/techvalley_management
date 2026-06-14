# Lambda Apps (테크밸리)

`ingress-deploy.yaml`의 `lambdas` 항목과 **9종** 1:1 대응. 상세: [15-lambda-development.md](../../../02.arch/15-lambda-development.md)

| App | deploy_group | 트리거 | 역할 |
|-----|--------------|--------|------|
| `stream-sync-consumer` | ingress | KDS ESM | decode → normalize → DocDB + Firehose |
| `dlq-shard-processor` | ingress | SQS (DLQ) | KDS DLQ shard 재처리 |
| `file-upload-orchestrator` | ingress | IoT file/* · KDS | S3 Presign · multipart · file/response |
| `batch-cadence-runner` | batch | EventBridge | cadence YAML → Aurora·Doc 롤업 |
| `batch-dlq-replay` | batch | EventBridge | pipeline_dlq_events 재실행 |
| `payload-converter` | invoke_only | Invoke | rules JSON 단건 변환 |
| `anomaly-scorer` | ml | KDS / EventBridge | SageMaker 이상 점수 |
| `rule-recommender` | ml | EventBridge | 규칙 추천 |
| `self-heal-orchestrator` | ml | EventBridge | Edge self-heal 오케스트레이션 |

## 개발

```bash
# apps/<name>/src/handler.mjs 수정 후
npm run lambda:assets
npm run test:local:ingress   # stream-sync-consumer
npm run test:local:batch     # batch-cadence-runner
npm run test:local:media     # file-upload-orchestrator
```

번들 산출물: `apps/<name>/bundle/` (gitignore 권장)

공통 라이브러리: `packages/pipeline-core/` (`@techvalley/pipeline-core`)
