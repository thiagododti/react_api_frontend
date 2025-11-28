// app/dashboard/page.tsx
import Protected from '../../components/Protected';

export default function DashboardPage() {
  return (
    <Protected>
      <h2>Dashboard protegido</h2>
      {/* resto */}
    </Protected>
  );
}
