import RecommendationWizard from '../components/RecommendationWizard';

export default function Recommend() {
  return (
    <div>
      <div className="page-hero" style={{ padding: '3.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Product Recommendation</h1>
          <p style={{ color: '#bfdbfe', fontSize: '1.05rem' }}>Answer a few questions to find the right tax software product</p>
        </div>
      </div>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '700px' }}>
        <RecommendationWizard />
      </div>
    </div>
  );
}
