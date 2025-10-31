# Motor.com M1 API Schema Documentation

This document provides a comprehensive overview of the Motor.com M1 API endpoints, including request/response structures, authentication requirements, and usage examples.

## Base URL
- **Production**: `https://sites.motor.com/m1`
- **Local Proxy**: `http://localhost:3001/api/motor-proxy`

## Authentication

All API requests require authentication via EBSCO credentials. The proxy server handles authentication automatically.

### Authentication Headers (when calling Motor.com directly)
```
Cookie: ebsco-auth=abc123...; session-id=xyz789...
```

Note: The authentication cookie is a session cookie obtained through EBSCO authentication. The proxy server handles this automatically.

## API Endpoints

### 1. Vehicle API

#### 1.1 Get Years
Get list of available vehicle years.

**Endpoint**: `GET /api/years`

**Response**: `Int32ListResponse`
```json
{
  "data": [2023, 2022, 2021, ...]
}
```

---

#### 1.2 Get Makes
Get list of makes for a specific year.

**Endpoint**: `GET /api/year/{year}/makes`

**Parameters**:
- `year` (path, required): Vehicle year (e.g., 2023)

**Response**: `MakeListResponse`
```json
{
  "data": ["Toyota", "Ford", "Honda", ...]
}
```

---

#### 1.3 Get Models
Get list of models for a specific year and make.

**Endpoint**: `GET /api/year/{year}/make/{make}/models`

**Parameters**:
- `year` (path, required): Vehicle year (e.g., 2023)
- `make` (path, required): Vehicle make (e.g., "Toyota")

**Response**: `ModelsResponseResponse`
```json
{
  "data": [
    {
      "model": "Camry",
      "vehicleId": "12345",
      ...
    },
    ...
  ]
}
```

---

#### 1.4 Get Vehicle by VIN
Get vehicle information by VIN number.

**Endpoint**: `GET /api/vin/{vin}/vehicle`

**Parameters**:
- `vin` (path, required): Vehicle Identification Number

**Response**: `VinVehicleResponseResponse`
```json
{
  "data": {
    "year": 2023,
    "make": "Toyota",
    "model": "Camry",
    "vehicleId": "12345",
    ...
  }
}
```

---

#### 1.5 Get Motor Models
Get motor vehicle models for a specific year and make.

**Endpoint**: `GET /api/motor/year/{year}/make/{make}/models`

**Parameters**:
- `year` (path, required): Vehicle year
- `make` (path, required): Vehicle make

**Response**: `ModelAndVehicleIdListResponse`
```json
{
  "data": [
    {
      "id": "12345",
      "model": "Camry LE 2.5L",
      "vehicleId": "12345"
    },
    ...
  ]
}
```

---

#### 1.6 Get Vehicles
Get model information for a list of vehicle IDs.

**Endpoint**: `POST /api/source/{contentSource}/vehicles`

**Parameters**:
- `contentSource` (path, required): Content source (e.g., "motor", "mitchell")

**Request Body**: `GetVehiclesRequest`
```json
{
  "year": 2023,
  "make": "Toyota",
  "model": "Camry"
}
```

**Response**: `ModelAndVehicleIdListResponse`

---

#### 1.7 Get Motor Vehicle Details
Get motor vehicle details for different OE vehicle IDs.

**Endpoint**: `GET /api/source/{contentSource}/{vehicleId}/motorvehicles`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID

**Response**: `ModelAndVehicleIdListResponse`

---

#### 1.8 Get Vehicle Name
Get vehicle name by vehicle ID.

**Endpoint**: `GET /api/source/{contentSource}/{vehicleId}/name`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID

**Response**: `StringResponse`
```json
{
  "data": "2023 Toyota Camry LE 2.5L"
}
```

---

### 2. Search API

#### 2.1 Search Articles by Vehicle
Search for articles related to a specific vehicle.

**Endpoint**: `GET /api/source/{contentSource}/vehicle/{vehicleId}/articles/v2`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID
- `searchTerm` (query, optional): Search term to filter articles
- `motorVehicleId` (query, optional): Motor vehicle ID for more specific results

**Response**: `SearchResultsResponse`
```json
{
  "filterTabs": [
    {
      "name": "maintenance",
      "displayName": "Maintenance",
      "articleTrailId": "...",
      ...
    },
    ...
  ],
  "articleDetails": [
    {
      "id": "article-123",
      "title": "Engine Oil Change",
      ...
    },
    ...
  ],
  "vehicleGeoBlockingDetails": {
    "blocked": false,
    "message": null
  }
}
```

---

### 3. Asset API

#### 3.1 Get Article by ID
Get article content and metadata.

**Endpoint**: `GET /api/source/{contentSource}/vehicle/{vehicleId}/article/{articleId}`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID
- `articleId` (path, required): Article ID
- `motorVehicleId` (query, optional): Motor vehicle ID
- `prettyPrint` (query, optional): Pretty print HTML output (boolean)
- `bucketName` (query, optional): Bucket name for organization
- `articleSubtype` (query, optional): Article subtype filter
- `searchTerm` (query, optional): Search term for highlighting

**Response**: `ArticleResponse`
```json
{
  "article": {
    "id": "article-123",
    "title": "Engine Oil Change",
    "content": "<html>...</html>",
    "contentType": "html",
    ...
  }
}
```

---

#### 3.2 Get Labor Details
Get labor operation details from MCDB.

**Endpoint**: `GET /api/source/{contentSource}/vehicle/{vehicleId}/labor/{articleId}`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID
- `articleId` (path, required): Labor operation ID
- `motorVehicleId` (query, optional): Motor vehicle ID
- `prettyPrint` (query, optional): Pretty print output (boolean)
- `searchTerm` (query, optional): Search term

**Response**: `LaborResponse`
```json
{
  "data": {
    "laborTime": "1.5",
    "description": "Replace engine oil and filter",
    ...
  }
}
```

---

#### 3.3 Get Raw XML
Get raw XML content of an article (for debugging).

**Endpoint**: `GET /api/source/{contentSource}/xml/{articleId}`

**Parameters**:
- `contentSource` (path, required): Content source
- `articleId` (path, required): Article ID

**Response**: Raw XML string

---

#### 3.4 Get Article Title
Get article title without full content.

**Endpoint**: `GET /api/source/{contentSource}/article/{articleId}/title`

**Parameters**:
- `contentSource` (path, required): Content source
- `articleId` (path, required): Article ID

**Response**: `StringResponse`
```json
{
  "data": "Engine Oil Change Procedure"
}
```

---

#### 3.5 Get Maintenance Schedules by Frequency
Get maintenance schedules organized by frequency.

**Endpoint**: `GET /api/source/{contentSource}/vehicle/{vehicleId}/maintenance-schedules/frequency`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID
- `motorVehicleId` (query, optional): Motor vehicle ID

**Response**: `MaintenanceSchedulesByFrequencyResponse`

---

#### 3.6 Get Maintenance Schedules by Interval
Get maintenance schedules organized by interval (mileage/time).

**Endpoint**: `GET /api/source/{contentSource}/vehicle/{vehicleId}/maintenance-schedules/interval`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID
- `intervalType` (query, required): Interval type ("Miles" or "Months")
- `motorVehicleId` (query, optional): Motor vehicle ID
- `severity` (query, optional): Severity filter ("Normal" or "Severe")

**Response**: `MaintenanceSchedulesByIntervalResponse`

---

#### 3.7 Get Maintenance Schedule Indicators
Get indicators for maintenance schedules.

**Endpoint**: `GET /api/source/{contentSource}/vehicle/{vehicleId}/maintenance-schedules/indicators`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID
- `motorVehicleId` (query, optional): Motor vehicle ID

**Response**: `IndicatorsWithMaintenanceSchedulesResponse`

---

#### 3.8 Get Asset (Images, Documents)
Get asset files like images, PDFs, or other documents referenced in articles.

**Endpoint**: `GET /api/assets/{assetId}`

**Parameters**:
- `assetId` (path, required): Unique asset identifier

**Response**: Binary content (image, PDF, etc.) with appropriate Content-Type header

**Note**: This endpoint returns the actual asset file. Common asset types include:
- Images: `.jpg`, `.png`, `.gif`, `.svg`
- Documents: `.pdf`
- Other media files

---

### 4. Bookmark API

#### 4.1 Save Bookmark
Save an article as a bookmark.

**Endpoint**: `POST /api/source/{contentSource}/vehicle/{vehicleId}/article/{articleId}/bookmark`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID
- `articleId` (path, required): Article ID

**Response**: `ArticleBookmarkResponse`
```json
{
  "bookmarkId": 12345,
  "created": "2023-10-31T12:00:00Z",
  ...
}
```

---

#### 4.2 Get Bookmark
Retrieve a saved bookmark by ID.

**Endpoint**: `GET /api/bookmark/{bookmarkId}`

**Parameters**:
- `bookmarkId` (path, required): Bookmark ID

**Response**: `ArticleResponse`

---

### 5. Parts API

#### 5.1 Get Parts for Vehicle
Get parts information for a specific vehicle.

**Endpoint**: `GET /api/source/{contentSource}/vehicle/{vehicleId}/parts`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID
- `motorVehicleId` (query, optional): Motor vehicle ID
- `searchTerm` (query, optional): Search term to filter parts

**Response**: `PartLineItemListResponse`
```json
{
  "data": [
    {
      "partNumber": "12345-67890",
      "description": "Engine Oil Filter",
      "price": 12.99,
      ...
    },
    ...
  ]
}
```

---

### 6. UI API

#### 6.1 Get Favicon
Get the favicon for the application.

**Endpoint**: `GET /api/ui/favicon`

**Response**: Binary favicon file

---

#### 6.2 Get Bootstrap CSS
Get Bootstrap CSS stylesheet.

**Endpoint**: `GET /api/ui/css/bootstrap`

**Response**: CSS stylesheet

---

#### 6.3 Get Banner HTML
Get banner HTML content.

**Endpoint**: `GET /api/ui/banner.html`

**Response**: HTML content

---

#### 6.4 Get User Settings
Get user interface settings.

**Endpoint**: `GET /api/ui/usersettings`

**Response**: `UiUserSettingsResponse`
```json
{
  "theme": "light",
  "language": "en",
  ...
}
```

---

#### 6.5 Get Feedback Configurations
Get feedback form configurations.

**Endpoint**: `GET /api/ui/feedbackconfigurations`

**Response**: `FeedbackConfigurationResponse`

---

#### 6.6 Save Feedback
Submit user feedback.

**Endpoint**: `POST /api/ui/savefeedback`

**Request Body**: `Feedback`
```json
{
  "rating": 5,
  "comment": "Great article!",
  "articleId": "article-123",
  ...
}
```

**Response**: Success (no body)

---

### 7. Error Logging API

#### 7.1 Log Client Error
Log a client-side error for debugging.

**Endpoint**: `POST /api/errorlogging`

**Request Body**:
```json
{
  "error": "Error message",
  "stackTrace": "...",
  "userAgent": "...",
  "url": "...",
  ...
}
```

**Response**: Success (no body)

---

### 8. Track Change API

#### 8.1 Get Track Changes
Get change tracking information.

**Endpoint**: `GET /api/source/{contentSource}/vehicle/{vehicleId}/trackchange`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID

**Response**: Track change data

---

#### 8.2 Save Track Change
Save change tracking information.

**Endpoint**: `POST /api/source/{contentSource}/vehicle/{vehicleId}/trackchange`

**Parameters**:
- `contentSource` (path, required): Content source
- `vehicleId` (path, required): Vehicle ID

**Request Body**: Track change data

**Response**: Success

---

### 9. Logout API

#### 9.1 Logout
End the current session.

**Endpoint**: `POST /api/logout`

**Response**: Success (no body)

---

## Content Source Enumeration

The `contentSource` parameter accepts the following values:
- `motor` - Motor.com content
- `mitchell` - Mitchell1 content
- `alldata` - AllData content
- Other provider-specific sources

---

## Common Response Structures

### Standard List Response
```typescript
interface ListResponse<T> {
  data?: T[];
  [key: string]: any;
}
```

### Standard Single Response
```typescript
interface SingleResponse<T> {
  data?: T;
  [key: string]: any;
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400,
  "message": "Detailed error description"
}
```

---

## Usage Examples

### Example 1: Get Vehicle Information
```typescript
// 1. Get available years
const years = await vehicleApi.getYears().toPromise();

// 2. Get makes for selected year
const makes = await vehicleApi.getMakes({ year: 2023 }).toPromise();

// 3. Get models for selected make
const models = await vehicleApi.getModels({ 
  year: 2023, 
  make: 'Toyota' 
}).toPromise();

// 4. Search articles for selected vehicle
const searchResults = await searchApi.getSearchResultsByVehicleId({
  contentSource: 'motor',
  vehicleId: '12345',
  searchTerm: 'oil change'
}).toPromise();

// 5. Get article content
const article = await assetApi.getArticleById({
  contentSource: 'motor',
  vehicleId: '12345',
  articleId: 'article-123'
}).toPromise();
```

### Example 2: Using the Proxy Server
```bash
# Start proxy server
cd proxy-server
npm start

# Make requests through proxy (no auth needed)
curl http://localhost:3001/api/motor-proxy/api/years

# Get an asset (image/PDF) through proxy
curl http://localhost:3001/api/motor-proxy/api/assets/unique-asset-id-here
```

---

## Notes

1. **Authentication**: All requests require valid EBSCO authentication. Use the proxy server for automatic authentication handling.

2. **Rate Limiting**: The API may have rate limiting. The proxy server should handle this appropriately.

3. **Asset URLs**: When articles contain references to assets (images, PDFs), they use the pattern `/api/assets/{assetId}`. These must be proxied through the authentication layer to work properly.

4. **Content Sources**: Different content sources may have different available data. Always check response data for availability.

5. **Vehicle IDs**: Vehicle IDs are unique identifiers assigned by the content provider. They are required for most content-related API calls.

6. **Search Terms**: Search terms are optional but improve result relevance when provided.

---

## Related Documentation

- [README.md](./README.md) - Application overview
- [PROXY_INTEGRATION.md](./PROXY_INTEGRATION.md) - Proxy server setup
- [proxy-server/README.md](./proxy-server/README.md) - Proxy API documentation
