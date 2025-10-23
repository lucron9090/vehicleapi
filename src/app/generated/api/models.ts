/* tslint:disable */
/* eslint-disable */
export { ContentSource } from './models/content-source';
export { FilterTabType } from './models/filter-tab-type';
export { IntervalType } from './models/interval-type';
export { MaintenanceScheduleSeverity } from './models/maintenance-schedule-severity';

// Additional model stubs - add actual types as needed
export interface ModelAndVehicleId {
  id?: string;
  model?: string;
  vehicleId?: string;
}

export interface ArticleDetails {
  id?: string;
  title?: string;
  [key: string]: any;
}

export interface SearchResultsResponse {
  filterTabs?: FilterTab[];
  articleDetails?: ArticleDetails[];
  vehicleGeoBlockingDetails?: VehicleGeoBlockingDetails;
}

export interface FilterTab {
  name?: string;
  displayName?: string;
  articleTrailId?: string;
  [key: string]: any;
}

export interface VehicleGeoBlockingDetails {
  blocked?: boolean;
  message?: string;
  [key: string]: any;
}

export interface ArticleResponse {
  article?: any;
  [key: string]: any;
}

export interface Int32ListResponse {
  data?: number[];
  [key: string]: any;
}

export interface MakeListResponse {
  data?: string[];
  [key: string]: any;
}

export interface ModelAndVehicleIdListResponse {
  data?: ModelAndVehicleId[];
  [key: string]: any;
}

export interface ModelsResponseResponse {
  data?: any[];
  [key: string]: any;
}

export interface StringResponse {
  data?: string;
  [key: string]: any;
}

export interface VinVehicleResponseResponse {
  data?: any;
  [key: string]: any;
}

export interface LaborResponse {
  data?: any;
  [key: string]: any;
}

export interface MaintenanceSchedulesByFrequencyResponse {
  data?: any;
  [key: string]: any;
}

export interface MaintenanceSchedulesByIntervalResponse {
  data?: any;
  [key: string]: any;
}

export interface IndicatorsWithMaintenanceSchedulesResponse {
  data?: any;
  [key: string]: any;
}

export interface GetVehiclesRequest {
  year?: number;
  make?: string;
  model?: string;
  [key: string]: any;
}
