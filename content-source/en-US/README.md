# OmniRoute Documentation

OmniRoute helps teams organize provider connections and route model requests through one service. Start with the concepts, set up a provider, then choose how your applications select models.

If you read only two guides, start with [Getting started](./getting-started.md) and [Provider setup](./provider-setup.md).

## Choose your path

**New to OmniRoute?** Read [Getting started](./getting-started.md), [Overview](./overview.md), and [Concepts](./concepts.md) before connecting your first provider.

**Connecting an application?** Review [API keys](./api-keys.md), [Client integration](./client-integration.md), and [Request format](./request-format.md).

**Tuning routing?** Explore [Model routing](./model-routing.md), [Routing rules](./routing-rules.md), and [Fallback routing](./fallback-routing.md).

**Operating a service?** Start at [Deployment](./deployment.md), [Monitoring](./monitoring.md), and [Security](./security.md).

## Documentation navigation

### Start here

| Guide | What you will learn |
| --- | --- |
| [Getting started](./getting-started.md) | A path from first connection to first routed request. |
| [Installation](./installation.md) | Prepare an OmniRoute deployment. |
| [Overview](./overview.md) | The relationship between clients, providers, and models. |
| [Concepts](./concepts.md) | Terms used throughout this documentation. |

### Providers and routing

| Guide | What you will learn |
| --- | --- |
| [Provider setup](./provider-setup.md) | Connect and verify a provider. |
| [API keys](./api-keys.md) | Manage credentials safely. |
| [Model routing](./model-routing.md) | Direct requests to the right model. |
| [Routing rules](./routing-rules.md) | Organize routing decisions. |
| [Fallback routing](./fallback-routing.md) | Plan for unavailable destinations. |
| [Load balancing](./load-balancing.md) | Distribute requests among destinations. |
| [Health checks](./health-checks.md) | Understand destination readiness. |
| [Store user guide](./stores-beta/user-guide.md) | Manage stored provider configuration. |

### Integrate and operate

| Guide | What you will learn |
| --- | --- |
| [Client integration](./client-integration.md) | Connect an application. |
| [OpenAI-compatible API](./openai-compatible-api.md) | Evaluate API compatibility. |
| [Request format](./request-format.md) | Prepare request payloads. |
| [Response format](./response-format.md) | Read model responses. |
| [Streaming](./streaming.md) | Handle incremental results. |
| [Rate limits](./rate-limits.md) | Plan request capacity. |
| [Usage and costs](./usage-and-costs.md) | Review usage and billing signals. |
| [Deployment](./deployment.md) | Operate a service deployment. |
| [Configuration](./configuration.md) | Keep settings consistent. |
| [Monitoring](./monitoring.md) | Observe routing outcomes. |
| [Security](./security.md) | Protect credentials and traffic. |

## At a glance

A client sends a model request to OmniRoute. OmniRoute selects a configured destination according to routing policy; that destination's provider performs the inference. Keep provider credentials private and verify routing before using a new destination in production.

## Need help?

See [Troubleshooting](./troubleshooting.md) for a diagnostic path, [FAQ](./faq.md) for common questions, and the [Glossary](./glossary.md) for unfamiliar terms.
