# kafka-info

Backstage plugin for displaying Kafka consumer group lag information for entities annotated with `kafka-info/consumer-groups`.

## Usage

Add the annotation to your component entity:

```yaml
metadata:
  annotations:
    kafka-info/consumer-groups: "my-consumer-group,another-group"
```

The plugin will show a card on the entity page with topic lag from the `aws_kafka_max_offset_lag_sum` Prometheus metric (via the backend proxy at `/api/proxy/kafka-lag/query`).

## Dynamic plugin export

To package as a dynamic plugin for Red Hat Developer Hub / Janus:

```bash
yarn export-dynamic
```

This runs `janus-cli package export-dynamic-plugin` and produces output in `dist-scalprum`.
