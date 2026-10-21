import { Extensions } from "./document";

// Security
export type SecuritySchemeObject =
    | ApiKeySecurityScheme
    | HttpSecurityScheme
    | OAuth2SecurityScheme
    | OpenIdConnectSecurityScheme;

type SecuritySchemeBase = Extensions & {
    description?: string;
};

export type ApiKeySecurityScheme = SecuritySchemeBase & {
    in: 'cookie' | 'header' | 'query';
    name: string;
    type: 'apiKey';
};

export type HttpSecurityScheme = SecuritySchemeBase & {
    bearerFormat?: string;
    scheme: string;
    type: 'http';
};

export type OAuth2SecurityScheme = SecuritySchemeBase & {
    flows: OAuthFlowsObject;
    type: 'oauth2';
};

export type OpenIdConnectSecurityScheme = SecuritySchemeBase & {
    openIdConnectUrl: string;
    type: 'openIdConnect';
};

export type OAuthFlowsObject = Extensions & {
    authorizationCode?: OAuthFlowObject;
    clientCredentials?: OAuthFlowObject;
    implicit?: OAuthFlowObject;
    password?: OAuthFlowObject;
};

export type OAuthFlowObject = Extensions & {
    authorizationUrl?: string;
    refreshUrl?: string;
    scopes: Record<string, string>;
    tokenUrl?: string;
};

// Keys are security scheme names, values are required scopes
export type SecurityRequirementObject = Record<string, string[]>;