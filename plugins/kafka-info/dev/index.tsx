import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { kafkaInfoPlugin, EntityKafkaInfoContent } from '../src';
import { Content, Header, Page } from '@backstage/core-components';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { createEntity } from './entity';

const DevPage = (): React.ReactElement => (
  <EntityProvider entity={createEntity()}>
    <Page themeId="home">
      <Header title="Kafka Info" />
      <Content>
        <EntityKafkaInfoContent />
      </Content>
    </Page>
  </EntityProvider>
);

createDevApp()
  .registerPlugin(kafkaInfoPlugin)
  .addPage({
    element: <DevPage />,
    title: 'Kafka Info',
    path: '/kafka-info',
  })
  .render();
