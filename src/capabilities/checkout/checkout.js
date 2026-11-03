export function createDebitCardGateway() {
  return { id: 'checkout.debit-card', async begin() { return { status: 'not_configured', provider: 'checkout.debit-card', message: 'Debit card checkout is not configured.' }; } };
}

export function createWhatsAppGateway({ phoneNumber, brand = 'the store', money = (value) => String(value) } = {}) {
  return {
    id: 'checkout.whatsapp',
    async begin({ cart }) {
      if (!phoneNumber) return { status: 'not_configured', provider: 'checkout.whatsapp', message: 'WhatsApp checkout is not configured.' };
      const lines = cart.getItems().map((item) => `• ${item.qty} × ${item.title || item.name} (${money(Number(item.price) * Number(item.qty))})`);
      const text = [`Hello ${brand}, I would like to place this order:`, ...lines, '', `Total: ${money(cart.total())}`].join('\n');
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      return { status: 'redirected', provider: 'checkout.whatsapp' };
    },
  };
}

export function createCheckoutOrchestrator({ providers = [], notify = () => {} } = {}) {
  const registry = new Map(providers.map((provider) => [provider.id, provider]));
  return {
    async begin(providerId, context) {
      const provider = registry.get(providerId) || registry.values().next().value;
      if (!provider) return { status: 'not_configured', message: 'No checkout provider is configured.' };
      const result = await provider.begin(context);
      if (result.status === 'not_configured') notify(result.message);
      return result;
    },
    providers: () => [...registry.keys()],
  };
}
