import type {
  CollectionFieldDef,
  CollectionItem,
  FieldDef,
  LinkValue,
  LocationValue,
  Source,
  StoredField,
} from "@magnisale/profile";

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="chip">
          {item}
        </li>
      ))}
    </ul>
  );
}

const outward = "font-medium text-action underline underline-offset-4 break-words";

function CollectionView({ def, items }: { def: CollectionFieldDef; items: CollectionItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-md border border-line p-4">
          <p className="font-semibold">{item.values[def.titleField]}</p>
          <dl className="mt-1 flex flex-col gap-2">
            {def.itemFields
              .filter((f) => f.key !== def.titleField && item.values[f.key] !== undefined)
              .map((f) => {
                const value = item.values[f.key]!;
                return (
                  <div key={f.key}>
                    <dt className="text-caption text-fg-muted">{f.label}</dt>
                    <dd className="whitespace-pre-line">
                      {Array.isArray(value) ? <Chips items={value} /> : value}
                    </dd>
                  </div>
                );
              })}
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function FieldValueView({ def, stored }: { def: FieldDef; stored: StoredField }) {
  const value = stored.value;
  switch (def.kind) {
    case "tags":
      return <Chips items={value as string[]} />;
    case "location": {
      const { city, state, country } = value as LocationValue;
      return <p>{[city, state, country].filter(Boolean).join(", ")}</p>;
    }
    case "links":
      return (
        <ul className="flex flex-col gap-1">
          {(value as LinkValue[]).map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className={outward}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      );
    case "url":
      return (
        <a href={value as string} target="_blank" rel="noopener noreferrer" className={outward}>
          {(value as string).replace(/^https?:\/\//, "")}
        </a>
      );
    case "email":
      return (
        <a href={`mailto:${value as string}`} className={outward}>
          {value as string}
        </a>
      );
    case "phone":
      return (
        <a href={`tel:${(value as string).replace(/[^+\d]/g, "")}`} className={outward}>
          {value as string}
        </a>
      );
    case "collection":
      return <CollectionView def={def} items={value as CollectionItem[]} />;
    case "longtext":
      return <p className="whitespace-pre-line">{value as string}</p>;
    default:
      return <p>{String(value)}</p>;
  }
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function sourceText(source: Source): string {
  const when = dateFormat.format(new Date(source.at));
  return source.kind === "owner" ? `Added by you · ${when}` : `From ${source.label} · ${when}`;
}
