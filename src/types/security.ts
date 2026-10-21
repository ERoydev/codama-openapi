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
    type: 'apiKey';
    name: string;
    in: 'query' | 'header' | 'cookie';
};

export type HttpSecurityScheme = SecuritySchemeBase & {
    type: 'http';
    scheme: string;
    bearerFormat?: string;
};

export type OAuth2SecurityScheme = SecuritySchemeBase & {
    type: 'oauth2';
    flows: OAuthFlowsObject;
};

export type OpenIdConnectSecurityScheme = SecuritySchemeBase & {
    type: 'openIdConnect';
    openIdConnectUrl: string;
};

export type OAuthFlowsObject = Extensions & {
    implicit?: OAuthFlowObject;
    password?: OAuthFlowObject;
    clientCredentials?: OAuthFlowObject;
    authorizationCode?: OAuthFlowObject;
};

export type OAuthFlowObject = Extensions & {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: Record<string, string>;
};

// Keys are security scheme names, values are required scopes
export type SecurityRequirementObject = Record<string, string[]>;