import { createDevApp } from '@backstage/dev-utils';
import { kafkaInfoPlugin } from '../src/plugin';
import '@backstage/ui/css/styles.css';

createDevApp()
  .registerPlugin(kafkaInfoPlugin)
  .addPage({
    element: <div>Kafka Info Plugin</div>,
    title: 'Root Page',
    path: '/kafka-info',
  })
  .render();
