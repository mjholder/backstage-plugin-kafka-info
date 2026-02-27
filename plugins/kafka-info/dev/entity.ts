import { Entity } from '@backstage/catalog-model';
import { KAFKA_INFO_ANNOTATION } from '../src/components/KafkaInfoComponent/constants';

export function createEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'example-component',
      annotations: {
        [KAFKA_INFO_ANNOTATION]: 'example-consumer-group',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'team-a',
    },
    ...overrides,
  };
}
