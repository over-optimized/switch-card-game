import { useUIStore } from '../stores';

interface HandControlsProps {
  selectedCount: number;
  onPlaySelected: () => void;
  onClearSelection: () => void;
}

export function HandControls({ 
  selectedCount, 
  onPlaySelected, 
  onClearSelection 
}: HandControlsProps) {
  const { settings, updateSettings } = useUIStore(state => ({
    settings: state.settings,
    updateSettings: state.updateSettings,
  }));

  const handleSortChange = (sortOrder: 'dealt' | 'rank' | 'suit') => {
    updateSettings({ handSortOrder: sortOrder });
  };

  return (
    <div className="hand-controls">
      <div className="sort-controls">
        <button 
          className={`sort-btn ${settings.handSortOrder === 'rank' ? 'active' : ''}`}
          onClick={() => handleSortChange('rank')}
        >
          By Rank
        </button>
        <button 
          className={`sort-btn ${settings.handSortOrder === 'suit' ? 'active' : ''}`}
          onClick={() => handleSortChange('suit')}
        >
          By Suit
        </button>
        <button 
          className={`sort-btn ${settings.handSortOrder === 'dealt' ? 'active' : ''}`}
          onClick={() => handleSortChange('dealt')}
        >
          As Dealt
        </button>
      </div>
      
      <div className="action-controls">
        <button 
          className={`play-btn ${selectedCount === 0 ? 'disabled' : ''}`}
          disabled={selectedCount === 0}
          onClick={onPlaySelected}
          title={selectedCount > 1 ? 'Last selected card will be on top' : ''}
        >
          Play Selected ({selectedCount})
        </button>
        <button 
          className={`clear-btn ${selectedCount === 0 ? 'hidden' : ''}`}
          onClick={onClearSelection}
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}