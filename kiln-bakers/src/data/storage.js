import { seedProducts } from './seedProducts';
import { supabase } from '../lib/supabaseClient';

const defaultSettings = {
  storeName: 'Kiln Bakers',
  storeAddress: '12, Baker Street, Chennai – 600001',
  storePhone: '+91 98765 43210',
  taxRate: 5,
  upiId: 'kilnbakers@upi',
  upiName: 'Kiln Bakers',
  whatsappNumber: '',
};

let productsSeeded = false;
let settingsSeeded = false;

const mapProductFromDb = row => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  description: row.description || '',
  image: row.image || '',
  available: row.available,
});

const mapOrderFromDb = row => ({
  id: row.id,
  billNo: row.bill_no,
  items: row.items,
  subtotal: Number(row.subtotal),
  discountAmt: Number(row.discount_amt),
  taxAmt: Number(row.tax_amt),
  total: Number(row.total),
  taxRate: Number(row.tax_rate),
  paymentStatus: row.payment_status,
  paymentMethod: row.payment_method,
  createdAt: row.created_at,
});

async function ensureProductsSeeded() {
  if (productsSeeded) return;
  const { data, error } = await supabase.from('products').select('id').limit(1);
  if (error) throw error;
  if (!data || data.length === 0) {
    const rows = seedProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description || '',
      image: p.image || '',
      available: p.available,
    }));
    const { error: insertError } = await supabase.from('products').insert(rows);
    if (insertError) throw insertError;
  }
  productsSeeded = true;
}

async function ensureSettingsSeeded() {
  if (settingsSeeded) return;
  const { data, error } = await supabase.from('app_settings').select('id').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) {
    const { error: insertError } = await supabase.from('app_settings').insert({
      id: 1,
      store_name: defaultSettings.storeName,
      store_address: defaultSettings.storeAddress,
      store_phone: defaultSettings.storePhone,
      tax_rate: defaultSettings.taxRate,
      upi_id: defaultSettings.upiId,
      upi_name: defaultSettings.upiName,
      whatsapp_number: defaultSettings.whatsappNumber,
    });
    if (insertError) throw insertError;
  }
  settingsSeeded = true;
}

export const productService = {
  async getAll() {
    await ensureProductsSeeded();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapProductFromDb);
  },

  async add(product) {
    const newProduct = { ...product, id: `p_${Date.now()}` };
    const { data, error } = await supabase
      .from('products')
      .insert({
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        description: newProduct.description || '',
        image: newProduct.image || '',
        available: newProduct.available,
      })
      .select()
      .single();
    if (error) throw error;
    return mapProductFromDb(data);
  },

  async update(id, changes) {
    const payload = {
      ...(changes.name !== undefined ? { name: changes.name } : {}),
      ...(changes.category !== undefined ? { category: changes.category } : {}),
      ...(changes.price !== undefined ? { price: changes.price } : {}),
      ...(changes.description !== undefined ? { description: changes.description } : {}),
      ...(changes.image !== undefined ? { image: changes.image } : {}),
      ...(changes.available !== undefined ? { available: changes.available } : {}),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};

function nextBillNo() {
  return `KB-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
}

export const orderService = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrderFromDb);
  },

  async add(order) {
    const payload = {
      id: `ord_${Date.now()}`,
      bill_no: nextBillNo(),
      items: order.items,
      subtotal: order.subtotal,
      discount_amt: order.discountAmt,
      tax_amt: order.taxAmt,
      total: order.total,
      tax_rate: order.taxRate,
      payment_status: order.paymentStatus,
      payment_method: order.paymentMethod,
    };
    const { data, error } = await supabase.from('orders').insert(payload).select().single();
    if (error) throw error;
    return mapOrderFromDb(data);
  },

  async getByMonth(year, month) {
    const start = new Date(year, month - 1, 1).toISOString();
    const end = new Date(year, month, 1).toISOString();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrderFromDb);
  },
};

export const settingsService = {
  async get() {
    await ensureSettingsSeeded();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return {
      storeName: data.store_name,
      storeAddress: data.store_address,
      storePhone: data.store_phone,
      taxRate: Number(data.tax_rate),
      upiId: data.upi_id,
      upiName: data.upi_name,
      whatsappNumber: data.whatsapp_number || '',
    };
  },

  async save(settings) {
    const { error } = await supabase.from('app_settings').upsert({
      id: 1,
      store_name: settings.storeName,
      store_address: settings.storeAddress,
      store_phone: settings.storePhone,
      tax_rate: settings.taxRate,
      upi_id: settings.upiId,
      upi_name: settings.upiName,
      whatsapp_number: settings.whatsappNumber,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },
};
