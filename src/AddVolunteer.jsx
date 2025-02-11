import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AddVolunteer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    area: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        'http://localhost:3000/api/volunteers/create',
        formData
      );
      setSuccess('Volunteer registered successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        area: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ textAlign: 'center', fontSize: '34px', fontWeight: 'bold', marginBottom: '20px' }}>Register as a Volunteer</h1>

        {error && (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', borderRadius: '4px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="name" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="email" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="password" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="phone" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="city" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>City</label>
            <input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="area" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Area</label>
            <input
              id="area"
              name="area"
              type="text"
              required
              value={formData.area}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: '22px',
                fontWeight: 'bold',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{ color: '#007BFF', textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddVolunteer;
