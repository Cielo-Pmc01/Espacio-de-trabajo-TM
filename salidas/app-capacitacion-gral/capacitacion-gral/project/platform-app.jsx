// platform-app.jsx — Root App with routing + avatar overlay

const { useState: useAppState } = React;
const { LoginView, SeasonView, ModulesView, BlocksView, ContentView, AdditionalInfoView, EvaluationView } = window;
const { AdminView } = window;
const { AvatarWidget } = window;

function App() {
  const [nav, setNav] = useAppState({
    view: 'login', user: null, season: null, module: null, block: null,
  });

  const go = (view, extra = {}) => setNav(n => ({ ...n, view, ...extra }));

  function handleLogin(user) {
    if (user.role === 'vendedor') go('season', { user });
    else go('admin', { user }); // admin, supervisor, editor all go to admin panel
  }
  function handleLogout() {
    go('login', { user: null, season: null, module: null, block: null });
  }

  const { view, user, season, module: mod, block } = nav;
  const showAvatar = user && view !== 'login' && view !== 'admin';

  function renderView() {
    if (view === 'login') return <LoginView onLogin={handleLogin} />;
    if (view === 'admin') return <AdminView user={user} onLogout={handleLogout} />;
    if (view === 'season') return (
      <SeasonView user={user}
        onSelect={s => go('modules', { season: s })}
        onLogout={handleLogout} />
    );
    if (view === 'modules') return (
      <ModulesView user={user} season={season}
        onSelectModule={m => go('blocks', { module: m })}
        onSelectAdditional={() => go('additional')}
        onBack={() => go('season')}
        onLogout={handleLogout} />
    );
    if (view === 'blocks') return (
      <BlocksView user={user} season={season} module={mod}
        onSelectBlock={b => go('content', { block: b })}
        onStartEval={() => go('evaluation')}
        onBack={() => go('modules')}
        onLogout={handleLogout} />
    );
    if (view === 'content') return (
      <ContentView user={user} season={season} module={mod} block={block}
        onBack={() => go('blocks')}
        onLogout={handleLogout} />
    );
    if (view === 'additional') {
      const info = getContent()[season]?.additionalInfo;
      return (
        <AdditionalInfoView user={user} season={season} info={info}
          onBack={() => go('modules')}
          onLogout={handleLogout} />
      );
    }
    if (view === 'evaluation') return (
      <EvaluationView user={user} season={season} module={mod}
        onBack={() => go('blocks')}
        onFinish={() => go('modules')}
        onLogout={handleLogout} />
    );
    return null;
  }

  return (
    <>
      {renderView()}
      {showAvatar && (
        <AvatarWidget user={user} season={season} module={mod} block={block} />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
