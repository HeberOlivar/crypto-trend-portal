import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function PortfolioDetails({ portfolioId, assets, initialAmount }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerformanceData();
  }, [portfolioId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      // Supondo que o backend forneça os dados de performance
      const response = await axios.get(`http://15.229.222.90:8000/portfolios/${portfolioId}/performance`);
      const performanceData = response.data;

      // Formatar os dados para o Chart.js
      const labels = Object.keys(performanceData.cumulative_profitability); // Dias no eixo X
      const datasets = [];

      // Adicionar uma linha para cada criptomoeda
      performanceData.assets.forEach((asset, index) => {
        const data = Object.values(asset.historical_values);
        datasets.push({
          label: asset.symbol,
          data: data,
          borderColor: getColor(index),
          backgroundColor: getColor(index, 0.2),
          fill: false,
          tension: 0.3, // Suavizar a linha
        });
      });

      // Adicionar a linha de rentabilidade acumulada
      const profitabilityData = Object.values(performanceData.cumulative_profitability);
      datasets.push({
        label: 'Rentabilidade Acumulada (%)',
        data: profitabilityData,
        borderColor: '#FFD700', // Amarelo para destaque
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderWidth: 3, // Linha mais espessa
        fill: false,
        tension: 0.3,
      });

      setChartData({
        labels: labels,
        datasets: datasets,
      });
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados de performance:', err);
      setError('Erro ao carregar os dados do gráfico.');
      setLoading(false);
    }
  };

  // Função para gerar cores diferentes para cada criptomoeda
  const getColor = (index, alpha = 1) => {
    const colors = [
      `rgba(75, 192, 192, ${alpha})`, // Verde
      `rgba(54, 162, 235, ${alpha})`, // Azul
      `rgba(153, 102, 255, ${alpha})`, // Roxo
      `rgba(255, 99, 132, ${alpha})`, // Vermelho
      `rgba(255, 159, 64, ${alpha})`, // Laranja
    ];
    return colors[index % colors.length];
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#FFFFFF',
        },
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#34C759',
        borderWidth: 1,
      },
      title: {
        display: true,
        text: 'Performance da Carteira',
        color: '#34C759',
        font: {
          size: 16,
          family: 'Poppins',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dias',
          color: '#FFFFFF',
          font: {
            size: 14,
            family: 'Poppins',
          },
        },
        ticks: {
          color: '#FFFFFF',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Valor (USDT) / Rentabilidade (%)',
          color: '#FFFFFF',
          font: {
            size: 14,
            family: 'Poppins',
          },
        },
        ticks: {
          color: '#FFFFFF',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  if (loading) {
    return <p>Carregando gráfico...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="portfolio-details">
      <h4>Performance da Carteira</h4>
      {chartData && (
        <div className="portfolio-chart">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}

export default PortfolioDetails;