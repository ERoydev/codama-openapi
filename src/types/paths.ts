import { CallbackObject, ExampleObject, Extensions, LinkObject, Ref, ServerObject } from './document';
import { SchemaObject } from './schema';
import { SecurityRequirementObject } from './security';

// Paths
export type PathsObject = Extensions & {
    [path: `/${string}`]: PathItemObject;
};

export type HttpMethod = 'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put' | 'trace';

export type PathItemObject = Extensions & {
    $ref?: string;
    delete?: OperationObject;
    description?: string;
    get?: OperationObject;
    head?: OperationObject;
    options?: OperationObject;
    parameters?: Ref<ParameterObject>[];
    patch?: OperationObject;
    post?: OperationObject;
    put?: OperationObject;
    servers?: ServerObject[];
    summary?: string;
    trace?: OperationObject;
};

// Operation
export type OperationObject = Extensions & {
    callbacks?: Record<string, Ref<CallbackObject>>;
    deprecated?: boolean;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    operationId?: string;
    parameters?: Ref<ParameterObject>[];
    requestBody?: Ref<RequestBodyObject>;
    responses: ResponsesObject;
    security?: SecurityRequirementObject[];
    servers?: ServerObject[];
    summary?: string;
    tags?: string[];
};

export type ExternalDocumentationObject = Extensions & {
    description?: string;
    url: string;
};

// Parameters & Headers
export type ParameterLocation = 'cookie' | 'header' | 'path' | 'query';

export type ParameterStyle = 'deepObject' | 'form' | 'label' | 'matrix' | 'pipeDelimited' | 'simple' | 'spaceDelimited';

// Fields shared by Parameter and Header objects
type ParameterBase = Extensions & {
    allowEmptyValue?: boolean;
    allowReserved?: boolean;
    content?: Record<string, MediaTypeObject>;
    deprecated?: boolean;
    description?: string;
    example?: unknown;
    examples?: Record<string, Ref<ExampleObject>>;
    explode?: boolean;
    required?: boolean;
    schema?: Ref<SchemaObject>;
    style?: ParameterStyle;
};

export type ParameterObject = ParameterBase & {
    in: ParameterLocation;
    name: string;
};

// A Header is a Parameter without "name" and "in"
export type HeaderObject = ParameterBase;

// Request Body & Media Types
export type RequestBodyObject = Extensions & {
    content: Record<string, MediaTypeObject>;
    description?: string;
    required?: boolean;
};

export type MediaTypeObject = Extensions & {
    encoding?: Record<string, EncodingObject>;
    example?: unknown;
    examples?: Record<string, Ref<ExampleObject>>;
    schema?: Ref<SchemaObject>;
};

export type EncodingObject = Extensions & {
    allowReserved?: boolean;
    contentType?: string;
    explode?: boolean;
    headers?: Record<string, Ref<HeaderObject>>;
    style?: ParameterStyle;
};

// Responses
// Keys are "default" or an HTTP status code / range such as "200" or "4XX"
export type ResponsesObject = Extensions & {
    [status: string]: Ref<ResponseObject>;
};

export type ResponseObject = Extensions & {
    content?: Record<string, MediaTypeObject>;
    description: string;
    headers?: Record<string, Ref<HeaderObject>>;
    links?: Record<string, Ref<LinkObject>>;
};
