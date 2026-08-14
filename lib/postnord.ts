/**
 * PostNord API Client — Booking API v3 (shipment-v3-booking-sao)
 * Correct schema confirmed by PostNord integration team (March 2026)
 *
 * Endpoint: POST /rest/shipment/v3/edi
 * Auth:     apikey as query parameter (?apikey=...)
 *
 * Key schema differences from naive assumptions:
 *  - consignor.partyIdentification.partyId  = customer number (required!)
 *  - address.streets                        = array of strings (not streetName)
 *  - weight at shipment level (totalGrossWeight), not inside goodsItem
 *  - goodsItem has "items" array with itemIdentification
 *  - applicationId is a number (not string)
 *  - contact uses emailAddress (not email)
 */

// ─── Config ──────────────────────────────────────────────────────────────────

export interface PostNordConfig {
    apiKey: string;
    applicationId: number | string;
    customerId?: string;
    environment: 'sandbox' | 'production';
}

// ─── Public request / response types ────────────────────────────────────────

export interface ShipmentAddress {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    countryCode: string;
    phone?: string;
    email?: string;
    sms?: string;
}

export interface ParcelDimensions {
    weight: number;   // kg
    length?: number;  // cm
    width?: number;
    height?: number;
}

export interface CreateShipmentRequest {
    customerId?: string;
    sender: ShipmentAddress;
    recipient: ShipmentAddress;
    parcel: ParcelDimensions;
    serviceCode: string;          // e.g. "19", "17"
    reference?: string;
    labelFormat?: 'PDF' | 'ZPL';
    additionalServices?: string[];
    loadingDate?: string;         // ISO-8601, defaults to now
}

export interface CreateShipmentResponse {
    shipmentId: string;
    trackingNumber: string;
    /**
     * Base64 data URI: "data:application/pdf;base64,..."
     * Store in labelUrl DB column. Frontend: use <a download> to save.
     */
    labelBase64?: string;
    labelUrl?: string;
    estimatedDelivery?: string;
}

export interface TrackingEventData {
    timestamp: string;
    status: string;
    description: string;
    location?: string;
    city?: string;
    countryCode?: string;
}

export interface TrackingStatus {
    trackingNumber: string;
    status: string;
    statusDescription: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    events: TrackingEventData[];
}

// ─── Internal EDI types (from PostNord team example) ─────────────────────────

interface EdiBody {
    messageDate: string;
    messageFunction: 'Instruction';
    messageId: string;
    application: {
        applicationId: number | string;
        name: string;
        version: string;
    };
    language: 'EN';
    updateIndicator: 'Original' | 'Update' | 'Deletion';
    shipment: EdiShipment[];
}

interface EdiShipment {
    shipmentIdentification: { shipmentId: string };
    dateAndTimes: { loadingDate: string };
    service: {
        basicServiceCode: string;
        additionalServiceCode?: string[];
    };
    numberOfPackages: { value: number };
    totalGrossWeight: { value: number; unit: 'KGM' };
    references?: Array<{ referenceNo: string; referenceType: string }>;
    parties: {
        consignor: EdiConsignor;
        consignee: EdiConsignee;
    };
    goodsItem: EdiGoodsItem[];
}

interface EdiConsignor {
    issuerCode: string;           // "Z12" for standard
    partyIdentification: {
        partyId: string;          // Customer number — THIS is what PostNord validates
        partyIdType: string;      // "160"
    };
    party: EdiPartyDetail;
}

interface EdiConsignee {
    party: EdiPartyDetail;
    reference?: { referenceNo: string; referenceType: string };
}

interface EdiPartyDetail {
    nameIdentification: { name: string };
    address: {
        streets: string[];        // Array of street address lines
        postalCode: string;
        city: string;
        countryCode: string;
    };
    contact?: {
        contactName?: string;
        emailAddress?: string;    // Note: emailAddress not email
        phoneNo?: string;
        smsNo?: string;
    };
}

interface EdiGoodsItem {
    marking?: string;
    goodsDescription?: string;
    packageTypeCode?: string;     // "PE" = Parcel
    items: Array<{
        itemIdentification: {
            itemId: string;
            itemIdType: string;   // "S10" for standard PostNord parcels
        };
    }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let msgCounter = 1;
function generateMessageId(): string {
    return `msg-${Date.now()}-${msgCounter++}`;
}

// ─── Client ─────────────────────────────────────────────────────────────────

class PostNordClient {
    private readonly apiKey: string;
    private readonly applicationId: number | string;
    private readonly baseUrl: string;
    private readonly defaultCustomerId?: string;

    constructor(config: PostNordConfig) {
        this.apiKey = config.apiKey;
        this.applicationId = config.applicationId;
        this.defaultCustomerId = config.customerId;
        this.baseUrl =
            config.environment === 'production'
                ? 'https://api2.postnord.com'
                : 'https://atapi2.postnord.com';
    }

    private url(path: string): string {
        const sep = path.includes('?') ? '&' : '?';
        return `${this.baseUrl}${path}${sep}apikey=${encodeURIComponent(this.apiKey)}`;
    }

    private resolveCustomerId(override?: string): string {
        const id = override || this.defaultCustomerId;
        if (!id) {
            throw new Error(
                'PostNord Customer ID required. Set POSTNORD_CUSTOMER_ID or pass customerId in request.'
            );
        }
        return id;
    }

    // ── Booking API v3 ─────────────────────────────────────────────────────

    /**
     * Book a shipment and receive a shipping label.
     *
     * Endpoint: POST /rest/shipment/v3/edi
     *
     * The consignor.partyIdentification.partyId must match a customer number
     * registered in PostNord's system. For marketplace/Partner accounts,
     * PostNord provisions your account to accept any sender address under
     * your customer number.
     */
    async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
        const customerId = this.resolveCustomerId(request.customerId);
        const loadingDate = request.loadingDate ?? new Date().toISOString().slice(0, 19);

        // Note: service code 19 (MyPack Collect) is Sweden-only.
        // For cross-border shipments (SE→DK, SE→NO, SE→FI), use service 17 (MyPack Home).
        const ediBody: EdiBody = {
            messageDate: new Date().toISOString(),
            messageFunction: 'Instruction',
            messageId: generateMessageId(),
            application: {
                applicationId: this.applicationId,
                name: 'CircuCity',
                version: '1.0',
            },
            language: 'EN',
            updateIndicator: 'Original',
            shipment: [
                {
                    shipmentIdentification: { shipmentId: '0' },
                    dateAndTimes: { loadingDate },
                    service: {
                        basicServiceCode: request.serviceCode,
                        additionalServiceCode: request.additionalServices ?? [],
                    },
                    numberOfPackages: { value: 1 },
                    totalGrossWeight: {
                        value: request.parcel.weight || 1.0,
                        unit: 'KGM',
                    },
                    ...(request.reference
                        ? {
                            references: [
                                { referenceNo: request.reference, referenceType: 'FLW' },
                            ],
                        }
                        : {}),
                    parties: {
                        consignor: {
                            issuerCode: 'Z12',
                            partyIdentification: {
                                partyId: customerId,   // Customer number — PostNord validates this
                                partyIdType: '160',
                            },
                            party: {
                                nameIdentification: { name: request.sender.name },
                                address: {
                                    streets: [request.sender.address],
                                    postalCode: request.sender.postalCode,
                                    city: request.sender.city,
                                    countryCode: request.sender.countryCode,
                                },
                                contact: {
                                    contactName: request.sender.name,
                                    emailAddress: request.sender.email ?? '',
                                    phoneNo: request.sender.phone,
                                    smsNo: request.sender.sms ?? request.sender.phone,
                                },
                            },
                        },
                        consignee: {
                            party: {
                                nameIdentification: { name: request.recipient.name },
                                address: {
                                    streets: [request.recipient.address],
                                    postalCode: request.recipient.postalCode,
                                    city: request.recipient.city,
                                    countryCode: request.recipient.countryCode,
                                },
                                contact: {
                                    contactName: request.recipient.name,
                                    emailAddress: request.recipient.email ?? '',
                                    phoneNo: request.recipient.phone,
                                    smsNo: request.recipient.sms ?? request.recipient.phone,
                                },
                            },
                            ...(request.reference
                                ? {
                                    reference: {
                                        referenceNo: request.reference,
                                        referenceType: 'FLW',
                                    },
                                }
                                : {}),
                        },
                    },
                    goodsItem: [
                        {
                            marking: request.reference ?? 'CircuCity Order',
                            goodsDescription: 'Goods',
                            packageTypeCode: 'PE',
                            items: [
                                {
                                    itemIdentification: {
                                        itemId: '0',
                                        itemIdType: 'S10',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const response = await fetch(this.url('/rest/shipment/v3/edi/labels/pdf?storeLabel=true'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ediBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`PostNord Booking API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Confirmed live response from POST /rest/shipment/v3/edi/labels/pdf:
        // {
        //   bookingResponse: {
        //     bookingId: "ILPN...",
        //     idInformation: [{ ids: [{ value: "00573...", printId: "63d0..." }], urls: [...] }]
        //   },
        //   labelPrintout: [{ printout: { labelFormat: "PDF", encoding: "base64", data: "..." } }]
        // }
        const booking = data?.bookingResponse || data;
        const idInfo = booking?.idInformation?.[0];
        const idEntry = idInfo?.ids?.[0];
        const trackingNumber = idEntry?.value || booking?.bookingId || '';
        const trackingUrl = idInfo?.urls?.find((u: any) => u.type === 'TRACKING')?.url;

        console.log(`[PostNord] Booking OK — tracking: ${trackingNumber}`);
        if (trackingUrl) console.log(`[PostNord] Track: ${trackingUrl}`);

        // Label PDF is in labelPrintout[0].printout.data (base64) 
        // OR labelPrintout[0].printout.link (if storeLabel=true)
        const printout = data?.labelPrintout?.[0]?.printout;
        const rawLabel: string | undefined = printout?.data;
        const labelUrl: string | undefined = printout?.link || printout?.url;
        
        const mimeType = printout?.labelFormat === 'ZPL' ? 'application/octet-stream' : 'application/pdf';
        const labelBase64 = rawLabel ? `data:${mimeType};base64,${rawLabel}` : undefined;

        return {
            shipmentId: booking?.bookingId || trackingNumber,
            trackingNumber,
            labelBase64,
            labelUrl,
            estimatedDelivery: undefined,
        };
    }

    // ── Track & Trace API v5 ───────────────────────────────────────────────

    async trackShipment(trackingNumber: string): Promise<TrackingStatus> {
        const response = await fetch(
            this.url(
                `/rest/shipment/v5/trackandtrace/findByIdentifier.json?id=${encodeURIComponent(trackingNumber)}&locale=en`
            ),
            { method: 'GET' }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`PostNord T&T API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const shipment = data?.TrackingInformationResponse?.shipments?.[0];

        if (!shipment) {
            throw new Error('No tracking information found for that tracking number.');
        }

        const events: TrackingEventData[] =
            shipment.items?.[0]?.events?.map((event: any) => ({
                timestamp: event.eventTime,
                status: event.status,
                description: event.eventDescription,
                location: event.location?.displayName,
                city: event.location?.city,
                countryCode: event.location?.countryCode,
            })) ?? [];

        return {
            trackingNumber,
            status: shipment.statusText?.header ?? 'UNKNOWN',
            statusDescription: shipment.statusText?.body ?? '',
            estimatedDelivery: shipment.estimatedTimeOfArrival,
            actualDelivery: shipment.deliveredTimeStamp,
            events,
        };
    }

    // ── Re-fetch label ─────────────────────────────────────────────────────

    async getShippingLabel(
        shipmentId: string,
        format: 'PDF' | 'ZPL' = 'PDF',
        storeLabel = false
    ): Promise<{ labelBase64?: string; labelUrl?: string }> {
        const queryParams = storeLabel ? '?storeLabel=true' : '';
        const response = await fetch(
            this.url(
                `/rest/shipment/v3/labels/ids/${format.toLowerCase()}${queryParams}`
            ),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([
                    {
                        id: shipmentId,
                        labelType: 'standard',
                    }
                ]),
            }
        );

        if (!response.ok) {
            throw new Error(`PostNord label retrieval failed: ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';
        
        // If PostNord returns the PDF binary natively:
        if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = format === 'ZPL' ? 'application/octet-stream' : 'application/pdf';
            return { labelBase64: `data:${mimeType};base64,${buffer.toString('base64')}` };
        }

        // Otherwise fallback to JSON parsing for Base64 enveloped payloads or URLs
        const data = await response.json();
        const labelEntry = data?.labels?.[0] || data?.labelPrintout?.[0]?.printout;
        
        const rawLabel: string | undefined = labelEntry?.content || labelEntry?.data || data?.content;
        const labelUrl: string | undefined = labelEntry?.link || labelEntry?.url || data?.link;

        if (!rawLabel && !labelUrl) {
            throw new Error('No label content or URL found in PostNord JSON response');
        }

        const mimeType = format === 'ZPL' ? 'application/octet-stream' : 'application/pdf';
        return {
            labelBase64: rawLabel ? `data:${mimeType};base64,${rawLabel}` : undefined,
            labelUrl: labelUrl
        };
    }

    // ── Cancel booking ─────────────────────────────────────────────────────

    async cancelShipment(shipmentId: string): Promise<boolean> {
        const customerId = this.defaultCustomerId;
        if (!customerId) throw new Error('Customer ID required to cancel a shipment.');

        const body: Partial<EdiBody> = {
            messageDate: new Date().toISOString(),
            messageFunction: 'Instruction',
            messageId: generateMessageId(),
            application: { applicationId: this.applicationId, name: 'CircuCity', version: '1.0' },
            language: 'EN',
            updateIndicator: 'Deletion',
            shipment: [
                {
                    shipmentIdentification: { shipmentId },
                    dateAndTimes: { loadingDate: new Date().toISOString().slice(0, 19) },
                    service: { basicServiceCode: '' },
                    numberOfPackages: { value: 0 },
                    totalGrossWeight: { value: 0, unit: 'KGM' },
                    parties: {
                        consignor: {
                            issuerCode: 'Z12',
                            partyIdentification: { partyId: customerId, partyIdType: '160' },
                            party: { nameIdentification: { name: '' }, address: { streets: [], postalCode: '', city: '', countryCode: '' } },
                        },
                        consignee: {
                            party: { nameIdentification: { name: '' }, address: { streets: [], postalCode: '', city: '', countryCode: '' } },
                        },
                    },
                    goodsItem: [],
                },
            ],
        };

        const response = await fetch(this.url('/rest/shipment/v3/edi'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`PostNord cancel error ${response.status}: ${await response.text()}`);
        }
        return response.ok;
    }

    // ── Service Points ─────────────────────────────────────────────────────

    async findServicePoints(
        countryCode: string,
        postalCode: string,
        city: string,
        limit = 10
    ): Promise<any[]> {
        const params = new URLSearchParams({ countryCode, postalCode, city, numberOfServicePoints: String(limit) });
        const response = await fetch(
            this.url(`/rest/businesslocation/v5/servicepoints/nearest/byaddress.json?${params}`),
            { method: 'GET' }
        );
        if (!response.ok) throw new Error(`PostNord service points error: ${response.status}`);
        const data = await response.json();
        return data?.servicePointInformationResponse?.servicePoints ?? [];
    }
}

// ─── Singleton factory ───────────────────────────────────────────────────────

let postnordClient: PostNordClient | null = null;

export function getPostNordClient(): PostNordClient {
    if (!postnordClient) {
        const apiKey = process.env.POSTNORD_API_KEY;
        const applicationId = Number(process.env.POSTNORD_APPLICATION_ID) || process.env.POSTNORD_APPLICATION_ID || '';
        const customerId = process.env.POSTNORD_CUSTOMER_ID;
        const environment = (process.env.POSTNORD_ENVIRONMENT ?? 'sandbox') as 'sandbox' | 'production';

        if (!apiKey) {
            throw new Error('POSTNORD_API_KEY is not set in environment variables.');
        }
        if (!applicationId) {
            console.warn('[PostNord] POSTNORD_APPLICATION_ID is not set. Required by the Booking API.');
        }

        postnordClient = new PostNordClient({ apiKey, applicationId, customerId, environment });
    }
    return postnordClient;
}

export default PostNordClient;
