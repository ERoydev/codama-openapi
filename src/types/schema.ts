import { Extensions, Ref } from "./document";
import { ExternalDocumentationObject } from "./paths";

// Schema 
export type SchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

export type SchemaObject = Extensions & {
    // Core
    type?: SchemaType;
    format?: string;
    title?: string;
    description?: string;
    default?: unknown;
    enum?: unknown[];
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    deprecated?: boolean;
    example?: unknown;
    externalDocs?: ExternalDocumentationObject;
    xml?: XmlObject;
    discriminator?: DiscriminatorObject;

    // Composition
    allOf?: Ref<SchemaObject>[];
    oneOf?: Ref<SchemaObject>[];
    anyOf?: Ref<SchemaObject>[];
    not?: Ref<SchemaObject>;

    // Numbers
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;

    // Strings
    maxLength?: number;
    minLength?: number;
    pattern?: string;

    // Arrays
    items?: Ref<SchemaObject>;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;

    // Objects
    properties?: Record<string, Ref<SchemaObject>>;
    additionalProperties?: boolean | Ref<SchemaObject>;
    required?: string[];
    maxProperties?: number;
    minProperties?: number;
};

export type DiscriminatorObject = {
    propertyName: string;
    mapping?: Record<string, string>;
};

export type XmlObject = Extensions & {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
};
