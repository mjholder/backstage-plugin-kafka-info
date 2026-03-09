import { useState, useEffect, useMemo } from 'react';
import { KAFKA_INFO_ANNOTATION } from './constants';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';

interface MetricResult {
  metric: { group?: string; topic?: string };
  value: [number, string];
}

export function KafkaInfoComponent() {
  const { entity } = useEntity();
  const title = 'Kafka Information';

  const config = useApi(configApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [metricResponse, setMetricResponse] = useState<{
    data?: { result?: MetricResult[] };
  }>({});
  const [filteredResponse, setFilteredResponse] = useState<MetricResult[]>([]);

  const backendUrl = config.getString('backend.baseUrl');
  const annotationValue =
    entity.metadata.annotations?.[KAFKA_INFO_ANNOTATION] ?? '';
  const consumerGroup = useMemo(
    () =>
      annotationValue
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    [annotationValue],
  );

  useEffect(() => {
    setLoading(true);
    fetchApi
      .fetch(
        `${backendUrl}/api/proxy/kafka-lag/query?query=aws_kafka_max_offset_lag_sum`,
      )
      .then(response => response.json())
      .then((text: { data?: { result?: MetricResult[] } }) => {
        setMetricResponse(text);
      })
      .catch(err => {
        setError(true);
        console.error('Error fetching topic data:', err);
        setLoading(false);
      });
  }, [backendUrl, fetchApi]);

  useEffect(() => {
    const results = metricResponse.data?.result ?? [];
    const filteredGroup = results.filter(mentry =>
      consumerGroup.some(e => e === mentry.metric.group),
    );
    if (filteredGroup.length === 0 && results.length > 0) {
      setError(true);
    }
    setFilteredResponse(filteredGroup);
    setLoading(false);
  }, [metricResponse, consumerGroup]);

  if (loading) {
    return (
      <InfoCard title={title}>
        <Typography>Loading...</Typography>
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title={title}>
        <Typography>Error loading {title}.</Typography>
      </InfoCard>
    );
  }

  return (
    <InfoCard title={title}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Topics</TableCell>
              <TableCell>Current Lag</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResponse?.map((ent, idx) => (
              <TableRow key={`${ent.metric.topic}-${idx}`}>
                <TableCell>{ent.metric.topic}</TableCell>
                <TableCell>{ent.value[1]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </InfoCard>
  );
}
