import type { Product } from '../api/api';

interface Props {
  products: Product[];
}

const COMPARISON_ROWS: { key: keyof Product; label: string }[] = [
  { key: 'price', label: 'Price (CAD)' },
  { key: 'supports_salary_income', label: 'Salary Income' },
  { key: 'supports_student_income', label: 'Student Income' },
  { key: 'supports_medical_expenses', label: 'Medical Expenses' },
  { key: 'supports_donations', label: 'Donations' },
  { key: 'supports_employment_expenses', label: 'Employment Expenses' },
  { key: 'supports_investment_income', label: 'Investment Income' },
  { key: 'supports_capital_gains', label: 'Capital Gains' },
  { key: 'supports_foreign_income', label: 'Foreign Income' },
  { key: 'supports_rental_income', label: 'Rental Income' },
  { key: 'supports_freelance_income', label: 'Freelance Income' },
  { key: 'supports_gig_work_income', label: 'Gig-Work Income' },
  { key: 'supports_business_expenses', label: 'Business Expenses' },
  { key: 'supports_home_office_expenses', label: 'Home-Office Expenses' },
  { key: 'supports_vehicle_expenses', label: 'Vehicle Expenses' },
  { key: 'supports_expert_help', label: 'Expert Help' },
  { key: 'supports_full_service', label: 'Full Service (Expert Files)' },
  { key: 'supports_corporate_filing', label: 'Corporate Filing' },
  { key: 'supports_nil_corporate_return', label: 'Nil Corporate Return' },
];

function Cell({ value, isPrice }: { value: boolean | string; isPrice?: boolean }) {
  if (isPrice) {
    const p = parseFloat(value as string);
    return (
      <td style={{
        padding: '0.75rem 1rem',
        textAlign: 'center',
        borderBottom: '1px solid #f1f5f9',
        fontWeight: 700,
        color: '#1e40af',
        fontSize: '0.9rem',
      }}>
        {p === 0 ? 'Free' : `$${p}`}
      </td>
    );
  }

  return (
    <td style={{
      padding: '0.75rem 1rem',
      textAlign: 'center',
      borderBottom: '1px solid #f1f5f9',
    }}>
      {value ? (
        <span style={{ color: '#16a34a', fontSize: '1.1rem', fontWeight: 700 }}>✓</span>
      ) : (
        <span style={{ color: '#d1d5db', fontSize: '1.1rem' }}>—</span>
      )}
    </td>
  );
}

export default function ComparisonTable({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
        <thead>
          <tr style={{ backgroundColor: '#0f172a' }}>
            <th style={{
              padding: '1rem',
              textAlign: 'left',
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #1e293b',
              minWidth: '200px',
              position: 'sticky',
              left: 0,
              backgroundColor: '#0f172a',
            }}>
              Feature
            </th>
            {products.map((p) => (
              <th key={p.id} style={{
                padding: '1rem',
                textAlign: 'center',
                color: '#f1f5f9',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderBottom: '2px solid #1e293b',
                minWidth: '120px',
              }}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, idx) => (
            <tr key={row.key} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
              <td style={{
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.875rem',
                borderBottom: '1px solid #f1f5f9',
                borderRight: '2px solid #e2e8f0',
                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                position: 'sticky',
                left: 0,
              }}>
                {row.label}
              </td>
              {products.map((p) => (
                <Cell
                  key={p.id}
                  value={p[row.key] as boolean | string}
                  isPrice={row.key === 'price'}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
