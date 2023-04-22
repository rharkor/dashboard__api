import { backhealthNode } from '@backhealth/node-sdk';
import { BACKHEALTH_API_KEY, ENVIRONMENT, PROJECT_NAME } from '../config';

const backhealth = backhealthNode;
backhealth.init({
  apiKey: BACKHEALTH_API_KEY,
  environment: ENVIRONMENT,
  project: PROJECT_NAME,
});

export default backhealth;
