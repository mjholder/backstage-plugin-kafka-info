import React, { useState, useEffect } from 'react';
import { KAFKA_INFO_ANNOTATION } from './constants';
import {
  Paper,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import {
  InfoCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';

export function KafkaInfoComponent(): React.ReactElement {
  const { entity } = useEntity();
  const title = 'Kafka Information';

  const config = useApi(configApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [metricResponse, setMetricResponse] = useState<Object>({});
  const [filteredResponse, setFilteredResponse] = useState<Object>({});

  const backendUrl = config.getString('backend.baseUrl');

  const consumerGroup = entity.metadata.annotations?.[KAFKA_INFO_ANNOTATION]?.split(',') ?? [];

  useEffect(() => {
    setLoading(true);
    fetchApi.fetch(`${backendUrl}/api/proxy/kafka-lag/query?query=aws_kafka_max_offset_lag_sum`)
      .then(response => {
        return response.json();
      })
      .then(text => {
        setMetricResponse(text);
      })
      .catch(err => {
        setError(true);
        console.error('Error fetching topic data:', err);
        setLoading(false);
      });
  }, [backendUrl, fetchApi]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    type MetricResult = { metric: { group: string; topic: string }; value: [number, string] };
    const data = (metricResponse as { data?: { result?: MetricResult[] } }).data;
    const filteredGroup = data?.result?.filter((mentry: MetricResult) => {
      return consumerGroup.some(e => e === mentry.metric.group);
    });
    if (filteredGroup === undefined || (Array.isArray(filteredGroup) && filteredGroup.length === 0)) {
      setError(true);
    }
    setFilteredResponse(filteredGroup ?? []);
    setLoading(false);
  }, [metricResponse, consumerGroup]);

  if (loading) {
    return (
      <InfoCard title={title}>
        <Typography align="center" variant="body1">Loading...</Typography>
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title={title}>
        <Typography align="center" variant="body1">
          Error loading {title}.
        </Typography>
      </InfoCard>
    );
  }

  const TopicsTable = () => {
    const results = filteredResponse as Array<{ metric: { topic: string }; value: [number, string] }>;
    return (
      <TableContainer component={Paper}>
        <Table size="small" aria-label="Topics">
          <TableHead>
            <TableRow>
              <TableCell>Topics</TableCell>
              <TableCell align="right">Current Lag</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results?.map((ent) => (
              <TableRow key={ent.metric.topic}>
                <TableCell component="th" scope="row">
                  {ent.metric.topic}
                </TableCell>
                <TableCell align="right">{ent.value[1]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <InfoCard title={title} noPadding>
      <TopicsTable />
    </InfoCard>
  );
}
