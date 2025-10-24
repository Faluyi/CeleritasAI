import React, { createContext, useContext, useState, useEffect } from 'react';
import { organizationService } from '../services/api';

const OrganizationContext = createContext();

export const useOrganizations = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizations must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getAll();
      setOrganizations(data.organizations);
      if (data.organizations.length > 0 && !selectedOrg) {
        setSelectedOrg(data.organizations[0]);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (name) => {
    try {
      const data = await organizationService.create(name);
      setOrganizations(prev => [...prev, data.organization]);
      return data.organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  const deleteOrganization = async (orgId) => {
    try {
      await organizationService.delete(orgId);
      setOrganizations(prev => prev.filter(org => org.id !== orgId));
      if (selectedOrg && selectedOrg.id === orgId) {
        setSelectedOrg(organizations.length > 1 ? organizations[0] : null);
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  };

  const value = {
    organizations,
    selectedOrg,
    setSelectedOrg,
    loading,
    loadOrganizations,
    createOrganization,
    deleteOrganization
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
