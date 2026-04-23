import {
  BuyerDemand,
  LogisticsJob,
  LogisticsJobStatus,
  Order,
  PickupRequest,
  PickupStatus,
  ProduceItem,
  ProductUnit,
} from '../types';

interface CreateProduceInput {
  farmerName: string;
  farmerLocation: string;
  crop: string;
  quantity: number;
  unit: ProductUnit;
  pricePerUnit: number;
}

interface CreateOrderInput {
  produceId: string;
  buyerName: string;
  buyerLocation: string;
  quantity: number;
}

interface CreatePickupInput {
  produceId: string;
  farmerName: string;
  pickupLocation: string;
  dropLocation: string;
  quantity: number;
  unit: ProductUnit;
  estimatedFareInr?: number;
}

interface CreateBuyerDemandInput {
  buyerName: string;
  buyerLocation: string;
  crop: string;
  quantity: number;
  unit: ProductUnit;
  priceTarget: number;
  deliveryWindow: string;
}

const simulateDelay = async (ms = 250): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

const generateId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const nowIso = (): string => new Date().toISOString();

const produceStore: ProduceItem[] = [
  {
    id: 'produce-1',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Indore',
    crop: 'Soybean',
    quantity: 150,
    unit: 'quintal',
    pricePerUnit: 4600,
    createdAt: nowIso(),
  },
  {
    id: 'produce-2',
    farmerName: 'Sunita Yadav',
    farmerLocation: 'Ujjain',
    crop: 'Wheat',
    quantity: 100,
    unit: 'quintal',
    pricePerUnit: 2275,
    createdAt: nowIso(),
  },
  {
    id: 'produce-3',
    farmerName: 'Kamal Singh',
    farmerLocation: 'Bhopal',
    crop: 'Onion',
    quantity: 80,
    unit: 'quintal',
    pricePerUnit: 2100,
    createdAt: nowIso(),
  },
];

const orderStore: Order[] = [];
const pickupStore: PickupRequest[] = [];
const logisticsJobStore: LogisticsJob[] = [];
const buyerDemandStore: BuyerDemand[] = [];

export const listProduce = async (): Promise<ProduceItem[]> => {
  await simulateDelay();
  return [...produceStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const addProduce = async (input: CreateProduceInput): Promise<ProduceItem> => {
  await simulateDelay();
  const item: ProduceItem = {
    id: generateId('produce'),
    createdAt: nowIso(),
    ...input,
  };
  produceStore.unshift(item);
  return item;
};

export const placeOrder = async (input: CreateOrderInput): Promise<Order> => {
  await simulateDelay();
  const produce = produceStore.find(item => item.id === input.produceId);
  if (!produce) {
    throw new Error('Produce item not found');
  }
  if (input.quantity <= 0 || input.quantity > produce.quantity) {
    throw new Error('Invalid quantity');
  }

  const order: Order = {
    id: generateId('order'),
    produceId: produce.id,
    crop: produce.crop,
    buyerName: input.buyerName,
    buyerLocation: input.buyerLocation,
    farmerName: produce.farmerName,
    quantity: input.quantity,
    unit: produce.unit,
    totalAmount: input.quantity * produce.pricePerUnit,
    status: 'placed',
    createdAt: nowIso(),
  };

  produce.quantity -= input.quantity;
  orderStore.unshift(order);
  return order;
};

export const listOrders = async (): Promise<Order[]> => {
  await simulateDelay();
  return [...orderStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const requestPickup = async (input: CreatePickupInput): Promise<PickupRequest> => {
  await simulateDelay();
  const pickup: PickupRequest = {
    id: generateId('pickup'),
    status: 'requested',
    requestedAt: nowIso(),
    ...input,
  };
  pickupStore.unshift(pickup);

  const produce = produceStore.find(item => item.id === input.produceId);
  const job: LogisticsJob = {
    id: generateId('job'),
    pickupRequestId: pickup.id,
    produceId: input.produceId,
    crop: produce?.crop || 'Crop',
    quantity: input.quantity,
    unit: input.unit,
    pickupLocation: input.pickupLocation,
    dropLocation: input.dropLocation,
    farmerName: input.farmerName,
    estimatedFareInr: input.estimatedFareInr,
    status: 'open',
    updatedAt: nowIso(),
  };
  logisticsJobStore.unshift(job);
  return pickup;
};

export const listPickupRequests = async (): Promise<PickupRequest[]> => {
  await simulateDelay();
  return [...pickupStore].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
};

export const listLogisticsJobs = async (): Promise<LogisticsJob[]> => {
  await simulateDelay();
  return [...logisticsJobStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const listBuyerDemands = async (): Promise<BuyerDemand[]> => {
  await simulateDelay();
  return [...buyerDemandStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const createBuyerDemand = async (input: CreateBuyerDemandInput): Promise<BuyerDemand> => {
  await simulateDelay();
  const d: BuyerDemand = {
    id: generateId('demand'),
    createdAt: nowIso(),
    status: 'open',
    ...input,
  };
  buyerDemandStore.unshift(d);
  return d;
};

export const acceptLogisticsJob = async (
  jobId: string,
  transporterId: string,
  transporterName: string
): Promise<LogisticsJob> => {
  await simulateDelay();
  const job = logisticsJobStore.find(item => item.id === jobId);
  if (!job) {
    throw new Error('Job not found');
  }
  job.status = 'accepted';
  job.acceptedByTransporterId = transporterId;
  job.acceptedByTransporterName = transporterName;
  job.updatedAt = nowIso();

  const pickup = pickupStore.find(item => item.id === job.pickupRequestId);
  if (pickup) {
    pickup.status = 'assigned';
    pickup.transporterId = transporterId;
    pickup.transporterName = transporterName;
  }
  return { ...job };
};

export const updateLogisticsJobStatus = async (
  jobId: string,
  status: LogisticsJobStatus
): Promise<LogisticsJob> => {
  await simulateDelay();
  const job = logisticsJobStore.find(item => item.id === jobId);
  if (!job) {
    throw new Error('Job not found');
  }
  job.status = status;
  job.updatedAt = nowIso();

  const pickup = pickupStore.find(item => item.id === job.pickupRequestId);
  if (pickup) {
    pickup.status = mapJobStatusToPickupStatus(status);
  }
  return { ...job };
};

const mapJobStatusToPickupStatus = (status: LogisticsJobStatus): PickupStatus => {
  if (status === 'open') return 'requested';
  if (status === 'accepted') return 'assigned';
  if (status === 'picked_up' || status === 'in_transit') return 'in_transit';
  return 'delivered';
};
