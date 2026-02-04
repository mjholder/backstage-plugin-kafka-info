import { createDevApp } from '@backstage/dev-utils';
import { kafkaInfoPlugin, KafkaInfoPage } from '../src/plugin';
import '@backstage/ui/css/styles.css';

createDevApp()
  .registerPlugin(kafkaInfoPlugin)
  .addPage({
    element: <KafkaInfoPage />,
    title: 'Root Page',
    path: '/kafka-info',
  })
  .render();
