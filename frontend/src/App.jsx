import { useState } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'

const menuItems = [
  { id: 'dashboard', icon: 'bi bi-graph-up', label: 'Dashboard' },
  { id: 'canteiros', icon: 'bi bi-flower1', label: 'Canteiros' },
  { id: 'plantas', icon: 'bi bi-leaf', label: 'Plantas' },
  { id: 'sensores', icon: 'bi bi-ui-radios', label: 'Sensores' },
  { id: 'relatorios', icon: 'bi bi-journal-check', label: 'Relatórios' },
]

const beds = [
  {
    name: 'Canteiro 01',
    plant: 'Tomate',
    humidity: 72,
    temperature: 26.4,
    status: 'Normal',
    statusType: 'normal',
  },
  {
    name: 'Canteiro 02',
    plant: 'Alface',
    humidity: 64,
    temperature: 25.8,
    status: 'Normal',
    statusType: 'normal',
  },
  {
    name: 'Canteiro 03',
    plant: 'Cenoura',
    humidity: 31,
    temperature: 28.7,
    status: 'Solo seco',
    statusType: 'danger',
  },
  {
    name: 'Canteiro 04',
    plant: 'Manjericão',
    humidity: 48,
    temperature: 27.1,
    status: 'Atenção',
    statusType: 'warning',
  },
]

const alerts = [
  {
    type: 'danger',
    icon: 'bi bi-droplet-half',
    title: 'Umidade baixa',
    description: 'Canteiro 03 está abaixo do nível recomendado.',
    time: 'Há 12 min',
  },
  {
    type: 'warning',
    icon: 'bi bi-thermometer-sun',
    title: 'Temperatura elevada',
    description: 'Temperatura acima de 28°C no Canteiro 03.',
    time: 'Há 24 min',
  },
  {
    type: 'info',
    icon: 'bi bi-plus-circle',
    title: 'Novo registro',
    description: 'Manjericão atualizado no Canteiro 04.',
    time: 'Há 1h',
  },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [period, setPeriod] = useState('24h')
  const [showNotifications, setShowNotifications] = useState(false)

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <img src="/planta.png" alt="Horta Escolar" />
          </div>

          <div className="brand-text">
            <strong>Gerenciador de Horta</strong>
          </div>
        </div>

        <div className="menu-section">
          <span className="menu-title">MENU PRINCIPAL</span>

          <nav>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`menu-item ${activePage === item.id ? 'active' : ''
                  }`}
                onClick={() => setActivePage(item.id)}
              >
                <span className="menu-icon">
                  <i className={item.icon}></i>
                </span>

                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">

          <div className="help-box">
            <div className="help-icon">?</div>

            <div>
              <strong>Precisa de ajuda?</strong>
              <span>Consulte o guia da horta</span>
            </div>
          </div>

          <div className="user-card">
            <div className="avatar">FL</div>

            <div className="user-info">
              <strong>Fernanda</strong>
              <span>Professora</span>
            </div>

            <button className="more-button">•••</button>
          </div>

        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        {/* TOPBAR */}
        <header className="topbar">

          <div className="breadcrumb">
            <span>Horta Escolar</span>
            <b>/</b>
            <strong>
              {menuItems.find((item) => item.id === activePage)?.label}
            </strong>
          </div>

          <div className="topbar-actions">

            <div className="date">
              <span>Hoje</span>
              <strong>{currentDate}</strong>
            </div>

            <div className="notification-wrapper">

              <button
                className="notification-button"
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
              >
                <i className="bi bi-bell-fill"></i>
                <span className="notification-dot"></span>
              </button>

              {showNotifications && (
                <div className="notification-menu">
                  <div className="notification-header">
                    <strong>Notificações</strong>
                    <span>3 novas</span>
                  </div>

                  {alerts.map((alert, index) => (
                    <div className="notification-item" key={index}>
                      <span>
                        <i className={alert.icon}></i>
                      </span>
                      <div>
                        <strong>{alert.title}</strong>
                        <p>{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <div className="content">

          {activePage === 'dashboard' && (
            <Dashboard
              period={period}
              setPeriod={setPeriod}
              beds={beds}
              alerts={alerts}
            />
          )}

          {activePage === 'canteiros' && (
            <PagePlaceholder
              icon="bi bi-flower1"
              title="Canteiros"
              description="Acompanhe todos os canteiros cadastrados na horta."
            />
          )}

          {activePage === 'plantas' && (
            <PagePlaceholder
              icon="bi bi-leaf-fill"
              title="Plantas"
              description="Consulte as plantas cadastradas e seus registros."
            />
          )}

          {activePage === 'sensores' && (
            <PagePlaceholder
              icon="bi bi-broadcast-pin"
              title="Sensores"
              description="Monitore os sensores instalados na horta."
            />
          )}

          {activePage === 'relatorios' && (
            <PagePlaceholder
              icon="bi bi-bar-chart-fill"
              title="Relatórios"
              description="Visualize análises e históricos da horta."
            />
          )}

        </div>

      </main>

    </div>
  )
}

// dashboard

function Dashboard({ period, setPeriod, beds, alerts }) {

  return (
    <>

      {/* PAGE HEADER */}
      <section className="page-header">

        <div>
          <span className="eyebrow">VISÃO GERAL</span>

          <h1>
            Bom dia, Fernanda!
          </h1>

          <p>
            Aqui está o resumo das condições da horta hoje.
          </p>
        </div>

        <button className="primary-button">
          + Novo registro
        </button>

      </section>


      {/* KPI CARDS */}
      <section className="stats-grid">

        <StatCard
          icon="bi bi-leaf-fill"
          title="Plantas"
          value="42"
          description="3 novas este mês"
          trend="+7,7%"
          positive
        />

        <StatCard
          icon="bi bi-droplet-fill"
          title="Umidade média"
          value="61%"
          description="Nível adequado"
          trend="+4,2%"
          positive
        />

        <StatCard
          icon="bi bi-thermometer-half"
          title="Temperatura"
          value="27,4°C"
          description="Dentro do esperado"
          trend="-1,3%"
        />

        <StatCard
          icon="bi bi-exclamation-triangle-fill"
          title="Alertas"
          value="02"
          description="Requerem atenção"
          trend="Agora"
          alert
        />
      </section>


      {/* MAIN GRID */}
      <section className="dashboard-grid">

        {/* CHART */}
        <div className="panel chart-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">UMIDADE DO SOLO</span>
            </div>

            <div className="period-selector">

              {['24h', '7d', '30d'].map((item) => (
                <button
                  key={item}
                  className={period === item ? 'selected' : ''}
                  onClick={() => setPeriod(item)}
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          <div className="chart-info">
            <strong>61%</strong>
            <span className="trend positive">↑ 4,2%</span>
            <small>vs. período anterior</small>
          </div>

          <HumidityChart />

        </div>


        {/* ALERTS */}
        <div className="panel alerts-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">ALERTAS RECENTES</span>
            </div>

            <button className="text-button">
              Ver todos
            </button>

          </div>

          <div className="alerts-list">

            {alerts.map((alert, index) => (

              <div
                className={`alert-item ${alert.type}`}
                key={index}
              >

                <span className="alert-icon">
                  <i className={alert.icon}></i>
                </span>

                <div className="alert-content">
                  <strong>{alert.title}</strong>

                  <p>
                    {alert.description}
                  </p>

                  <span>{alert.time}</span>
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* BOTTOM GRID */}
      <section className="bottom-grid">

        {/* BEDS */}
        <div className="panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                STATUS DOS CANTEIROS
              </span>

            </div>

            <button className="text-button">
              Ver todos →
            </button>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Canteiro</th>
                  <th>Planta</th>
                  <th>Umidade</th>
                  <th>Temperatura</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {beds.map((bed) => (

                  <tr key={bed.name}>

                    <td>
                      <div className="bed-name">
                        <div className="bed-icon">
                          <i className="bi bi-flower1"></i>
                        </div>

                        <strong>{bed.name}</strong>
                      </div>
                    </td>
                    <td>
                      {bed.plant}
                    </td>

                    <td>
                      <div className="humidity-cell">

                        <div className="mini-progress">
                          <div
                            style={{
                              width: `${bed.humidity}%`,
                            }}
                          ></div>
                        </div>

                        <span>{bed.humidity}%</span>

                      </div>
                    </td>

                    <td>
                      {bed.temperature}°C
                    </td>

                    <td>
                      <span
                        className={`status ${bed.statusType}`}
                      >
                        <i></i>
                        {bed.status}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* ENVIRONMENT */}
        <div className="panel environment-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                AMBIENTE
              </span>

            </div>

            <span className="live">
              <i></i>
              Ao vivo
            </span>

          </div>


          <div className="environment-grid">

            <EnvironmentCard
              icon="bi bi-brightness-high"
              label="Luminosidade"
              value="78%"
              status="Boa"
            />

            <EnvironmentCard
              icon="bi bi-cloud-haze2"
              label="Umidade do ar"
              value="69%"
              status="Ideal"
            />

            <EnvironmentCard
              icon="bi bi-thermometer-half"
              label="Temperatura"
              value="27,4°C"
              status="Normal"
            />

            <EnvironmentCard
              icon="bi bi-cloud-rain"
              label="Previsão"
              value="12mm"
              status="Chuva hoje"
            />

          </div>

        </div>

      </section>

    </>
  )
}


// Componentes

function StatCard({
  icon,
  title,
  value,
  description,
  trend,
  positive,
  alert,
}) {

  return (
    <div className={`stat-card ${alert ? 'has-alert' : ''}`}>

      <div className="stat-top">

        <div className="stat-icon">
          <i className={icon}></i>
        </div>

        <span
          className={`stat-trend ${positive ? 'positive' : ''
            } ${alert ? 'alert-trend' : ''}`}
        >
          {trend}
        </span>

      </div>

      <span className="stat-title">
        {title}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

      <span className="stat-description">
        {description}
      </span>

    </div>
  )
}


function EnvironmentCard({
  icon,
  label,
  value,
  status,
}) {

  return (
    <div className="environment-card">

      <div className="environment-icon">
        <i className={icon}></i>
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{status}</small>
      </div>

    </div>
  )
}


// Gráfico

function HumidityChart() {

  return (
    <div className="chart">

      <div className="chart-y">

        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>

      </div>

      <div className="chart-area">

        <div className="grid-lines">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <svg
          viewBox="0 0 800 260"
          preserveAspectRatio="none"
          className="chart-svg"
        >

          <defs>

            <linearGradient
              id="areaGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >

              <stop
                offset="0%"
                stopColor="#4d9f63"
                stopOpacity="0.28"
              />

              <stop
                offset="100%"
                stopColor="#4d9f63"
                stopOpacity="0"
              />

            </linearGradient>

          </defs>

          <path
            d="M0,130
            C60,120 80,145 120,125
            C170,100 190,115 230,95
            C280,70 300,110 350,90
            C400,70 420,85 465,72
            C510,58 540,90 575,78
            C620,62 650,82 690,60
            C730,40 760,62 800,45
            L800,260
            L0,260 Z"
            fill="url(#areaGradient)"
          />

          <path
            d="M0,130
            C60,120 80,145 120,125
            C170,100 190,115 230,95
            C280,70 300,110 350,90
            C400,70 420,85 465,72
            C510,58 540,90 575,78
            C620,62 650,82 690,60
            C730,40 760,62 800,45"
            fill="none"
            stroke="#4d9f63"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <circle
            cx="690"
            cy="60"
            r="6"
            fill="#ffffff"
            stroke="#4d9f63"
            strokeWidth="4"
          />

        </svg>

        <div className="chart-x">
          <span>00h</span>
          <span>04h</span>
          <span>08h</span>
          <span>12h</span>
          <span>16h</span>
          <span>20h</span>
          <span>24h</span>
        </div>

      </div>

    </div>
  )
}

// Temporário

function PagePlaceholder({
  icon,
  title,
  description,
}) {

  return (
    <section className="placeholder">

      <div className="placeholder-icon">
        <i className={icon}></i>
      </div>

      <span className="eyebrow">
        MÓDULO
      </span>

      <h1>{title}</h1>

      <p>{description}</p>

      <button className="primary-button">
        Em breve
      </button>

    </section>
  )
}

export default App