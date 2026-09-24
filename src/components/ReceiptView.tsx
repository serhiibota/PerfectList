import type { Ref } from 'react';
import type { ShoppingList } from '@/types/shopping';
import { formatDate, formatMoney, formatQuantity, itemTotal, pluralItems, sumItems } from '@/lib/format';

interface Props {
  list: ShoppingList;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Static, control-free rendition of the list used for the long PNG export.
 * Always light and self-contained (inline colors) so the image looks the same everywhere.
 */
export function ReceiptView({ list, ref }: Props) {
  const stores = list.stores
    .map((store) => ({
      store,
      items: list.items
        .filter((i) => i.storeId === store.id)
        .sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted) || a.createdAt - b.createdAt),
    }))
    .filter((s) => s.items.length > 0);

  const total = sumItems(list.items);
  const remaining = sumItems(list.items.filter((i) => !i.isCompleted));
  const count = list.items.length;

  const ink = '#1d1d1f';
  const muted = '#8e8e93';
  const line = 'rgba(0,0,0,0.08)';
  const accent = '#2f6bff';

  return (
    <div
      ref={ref}
      style={{
        width: 440,
        padding: '36px 24px 28px',
        background: 'linear-gradient(180deg, #f7f6f3 0%, #f1efea 100%)',
        color: ink,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 28,
          padding: '30px 26px 26px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 24px 48px -24px rgba(0,0,0,0.18)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {/* Heading */}
        <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: muted, fontWeight: 600 }}>
          Список покупок
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 8 }}>
          {list.title}
        </div>
        <div style={{ fontSize: 13, color: muted, marginTop: 6 }}>
          {formatDate(Date.now())} · {count} {pluralItems(count)} · {stores.length}{' '}
          {stores.length === 1 ? 'магазин' : stores.length >= 2 && stores.length <= 4 ? 'магазина' : 'магазинов'}
        </div>

        {/* Stores */}
        {stores.map(({ store, items }) => (
          <div key={store.id} style={{ marginTop: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                paddingBottom: 10,
                borderBottom: `1px dashed ${line}`,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-0.01em' }}>{store.name}</span>
              <span style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(sumItems(items))}
              </span>
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0 0' }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    flexShrink: 0,
                    marginTop: 2,
                    border: `1.5px solid ${item.isCompleted ? accent : '#c7c7cc'}`,
                    background: item.isCompleted ? accent : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  {item.isCompleted && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.3,
                      color: item.isCompleted ? muted : ink,
                      textDecoration: item.isCompleted ? 'line-through' : 'none',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: 12, color: muted, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                    {formatQuantity(item.quantity)} {item.unit}
                    {item.estimatedPrice !== undefined && ` × ${formatMoney(item.estimatedPrice, false)}`}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: item.isCompleted ? muted : '#4a4a4f',
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.estimatedPrice !== undefined ? formatMoney(itemTotal(item)) : '—'}
                </span>
              </div>
            ))}
          </div>
        ))}

        {stores.length === 0 && (
          <div style={{ marginTop: 28, fontSize: 14, color: muted, textAlign: 'center' }}>Список пока пуст</div>
        )}

        {/* Totals */}
        <div style={{ marginTop: 28, paddingTop: 18, borderTop: `1.5px solid ${ink}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Итого
            </span>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(total)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              color: muted,
              marginTop: 6,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span>Осталось потратить</span>
            <span style={{ color: ink, fontWeight: 600 }}>{formatMoney(remaining)}</span>
          </div>
        </div>
      </div>

      {/* Branded footer */}
      <div
        style={{
          marginTop: 22,
          textAlign: 'center',
          fontSize: 12,
          letterSpacing: '0.04em',
          color: '#a1a1a6',
        }}
      >
        ✨ Скомпоновано в <span style={{ color: '#6e6e73', fontWeight: 600 }}>MinimalList</span>
      </div>
    </div>
  );
}
