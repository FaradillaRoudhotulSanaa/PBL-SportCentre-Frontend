import axiosInstance from '../config/axios.config';
import { Field, FieldReview, FieldType, Booking } from '../types';
import { bookingApi } from './booking.api';

// Interface untuk format respons dengan data dan meta
interface FieldResponseWithMeta {
  data: Field[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

export interface FieldListParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  search?: string;
  q?: string;
}

interface FieldReviewResponseWithMeta {
  data: FieldReview[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

class FieldApi {
  /**
   * Dapatkan semua lapangan
   * @returns Promise dengan array data lapangan
   */
  async getAllFields(params?: FieldListParams): Promise<FieldResponseWithMeta> {
    const response = await axiosInstance.get<FieldResponseWithMeta>('/fields', {params});
    console.log("fields data: ", response.data);
    return response.data;
  }

  /**
   * Dapatkan lapangan berdasarkan ID
   * @param id - ID lapangan
   * @returns Promise dengan data lapangan
   */
  async getFieldById(id: number): Promise<Field> {
    try {
      const response = await axiosInstance.get<
        { data: Field } | 
        { field: Field } | 
        Field | 
        { status: boolean; message: string; data: Field }
      >(`/fields/${id}`);

      if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && !('status' in response.data)) {
          return response.data.data;
        } else if ('field' in response.data) {
          return response.data.field;
        } else if ('id' in response.data && 'name' in response.data) {
          return response.data as Field;
        } else if ('status' in response.data && 'message' in response.data && 'data' in response.data) {
          return response.data.data as Field;
        }
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      console.error(`Error fetching field with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Dapatkan lapangan berdasarkan ID cabang
   * @param branchId - ID cabang
   * @returns Promise dengan array data lapangan
   */
  async getFieldsByBranchId(branchId: number): Promise<Field[]> {
    try {
      const response = await axiosInstance.get<FieldResponseWithMeta | { fields: Field[] } | Field[]>(`/branches/${branchId}/fields`);
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { fields: [...] }
        else if ('fields' in response.data && Array.isArray(response.data.fields)) {
          return response.data.fields;
        }
        // Format 3: Array langsung [...]
        else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Jika format tidak dikenali, kembalikan array kosong
      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching fields for branch ID ${branchId}:`, error);
      return [];
    }
  }

  /**
   * Dapatkan semua tipe lapangan
   * @returns Promise dengan array tipe lapangan
   */
  async getFieldTypes(): Promise<FieldType[]> {
    try {
      const response = await axiosInstance.get<{ data: FieldType[] } | { fieldTypes: FieldType[] } | FieldType[]>('/field-types');
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { fieldTypes: [...] }
        else if ('fieldTypes' in response.data && Array.isArray(response.data.fieldTypes)) {
          return response.data.fieldTypes;
        }
        // Format 3: Array langsung [...]
        else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Jika format tidak dikenali, kembalikan array kosong
      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching field types:', error);
      return [];
    }
  }

  /**
   * Buat lapangan baru
   * @param data - Data lapangan baru
   * @returns Promise dengan data lapangan yang berhasil dibuat
   */
  async createField(data: Omit<Field, 'id' | 'createdAt'>): Promise<Field> {
    const response = await axiosInstance.post<{ field: Field }>('/fields', data);
    return response.data.field;
  }

  /**
   * Update data lapangan
   * @param id - ID lapangan
   * @param data - Data lapangan yang akan diupdate
   * @returns Promise dengan data lapangan yang berhasil diupdate
   */
  async updateField(id: number, data: Partial<Omit<Field, 'id' | 'createdAt'>>): Promise<Field> {
    const response = await axiosInstance.put<{ field: Field }>(`/fields/${id}`, data);
    return response.data.field;
  }

  /**
   * Hapus lapangan
   * @param id - ID lapangan
   * @returns Promise dengan pesan sukses
   */
  async deleteField(id: number): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/fields/${id}`);
    return response.data;
  }

  /**
   * Upload gambar untuk lapangan
   * @param id - ID lapangan
   * @param image - File gambar
   * @returns Promise dengan URL gambar yang berhasil diupload
   */
  async uploadFieldImage(id: number, image: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await axiosInstance.post<{ imageUrl: string }>(`/fields/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Dapatkan review lapangan
   * @param fieldId - ID lapangan
   * @returns Promise dengan array data review
   */
  async getFieldReviews(fieldId: number): Promise<FieldReviewResponseWithMeta> {
    const response = await axiosInstance.get<FieldReviewResponseWithMeta>(`/field-reviews?fieldId=${fieldId}`);
    console.log("reviews data: ", response.data);
    return response.data;
  }

  /**
   * Buat review lapangan
   * @param fieldId - ID lapangan
   * @param data - Data review baru
   * @returns Promise dengan data review yang berhasil dibuat
   */
  async createFieldReview(
    fieldId: number,
    data: { rating: number; review?: string }
  ): Promise<FieldReview> {
    const response = await axiosInstance.post<{ review: FieldReview }>(`/fields/${fieldId}/reviews`, data);
    return response.data.review;
  }

  /**
   * Cek ketersediaan lapangan
   * @param fieldId - ID lapangan
   * @param date - Tanggal booking
   * @returns Promise dengan data slot waktu tersedia
   */
  async checkFieldAvailability(fieldId: number, date: string): Promise<{ slots: { time: string, available: boolean }[] }> {
    try {
      const response = await axiosInstance.get<{ data: { slots: { time: string, available: boolean }[] } } | { slots: { time: string, available: boolean }[] }>(`/fields/${fieldId}/availability?date=${date}&noCache=true`);
      
      // Format 1: { data: { slots: [...] } }
      if ('data' in response.data && response.data.data.slots) {
        return { slots: response.data.data.slots };
      }
      // Format 2: { slots: [...] }
      else if ('slots' in response.data) {
        return { slots: response.data.slots };
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error(`Error checking field availability for field ID ${fieldId}:`, error);
      return { slots: [] };
    }
  }

  /**
   * Mendapatkan data slot waktu yang terpesan untuk lapangan berdasarkan cabang, tanggal dan waktu
   * @param selectedBranch - ID cabang
   * @param selectedDate - Tanggal booking (format: YYYY-MM-DD)
   * @param fields - Data lapangan
   * @param times - Array waktu dalam format "HH:MM"
   * @returns Promise dengan object yang berisi ID lapangan dan array waktu yang terpesan
   */
  async fetchBookedTimeSlots(
    selectedBranch: number,
    selectedDate: string,
    fields: Field[],
    times: string[]
  ): Promise<{[key: number]: string[]}> {
    try {
      // Force refresh data - hapus cache dari tanggal yang dipilih
      const cacheKey = `${selectedBranch}_${selectedDate}`;
      sessionStorage.removeItem(cacheKey);
      
      console.log('Fetching availability for date:', selectedDate);
      const booked: {[key: number]: string[]} = {};
      
      // Gunakan endpoint untuk mendapatkan ketersediaan semua lapangan sekaligus
      try {
        const response = await axiosInstance.get(`/fields/availability`, {
          params: { 
            date: selectedDate,
            branchId: selectedBranch > 0 ? selectedBranch : undefined,
            noCache: true
          }
        });
        
        // Proses respons API
        const responseData = response.data as any;
        
        if (responseData && responseData.success && Array.isArray(responseData.data)) {
          // console.log('Successfully fetched availability data:', responseData.data.length, 'fields');
          
          // Iterasi setiap lapangan dalam respons
          responseData.data.forEach((fieldAvailability: any) => {
            const fieldId = fieldAvailability.fieldId;
            const availableTimeSlots = fieldAvailability.availableTimeSlots || [];
            
            // Konversi slot waktu tersedia menjadi rentang jam yang tersedia
            // Kita akan membuat set dari semua jam yang tersedia
            const availableHoursSet = new Set<string>();
            
            // Iterasi setiap slot waktu tersedia
            // PENTING: Backend menyimpan waktu dalam UTC, kita perlu mengkonversinya ke lokal
            availableTimeSlots.forEach((slot: any) => {
              // Parse ISO string ke objek Date (tetap dalam UTC)
              const startTime = new Date(slot.start);
              const endTime = new Date(slot.end);
              
              // Log untuk debugging
              // console.log(`Slot original UTC - start: ${startTime.toISOString()}, end: ${endTime.toISOString()}`);
              
              // Gunakan timezone lokal untuk mendapatkan jam yang sesuai
              const localStartHour = startTime.getHours();
              const localEndHour = endTime.getHours();
              
              // console.log(`Slot hours - start: ${localStartHour}:00, end: ${localEndHour}:00`);
              
              // Penanganan khusus: jika slot mencakup 00:00-24:00 (seluruh hari)
              if (startTime.getHours() === 0 && endTime.getHours() === 0 &&
                  startTime.getDate() === endTime.getDate() - 1) {
                // Seluruh hari tersedia, tambahkan semua jam
                times.forEach(time => availableHoursSet.add(time));
              } else {
                // Dapatkan semua jam di antara waktu mulai dan selesai (end time exclusive)
                // PENTING: endTime bersifat exclusive sehingga booking 8:00-10:00 berarti 
                // hanya jam 8:00 dan 9:00 yang terpesan, sementara jam 10:00 masih tersedia
                for (let hour = localStartHour; hour < localEndHour; hour++) {
                  availableHoursSet.add(`${hour.toString().padStart(2, '0')}:00`);
                }

                // Kasus khusus: jika endTime adalah 00:00 (tengah malam), tambahkan 23:00
                if (localEndHour === 0 && endTime.getMinutes() === 0) {
                  availableHoursSet.add("23:00");
                }
              }
            });
            
            // Semua jam yang tidak ada dalam availableHoursSet dianggap terpesan
            const bookedHours = times.filter(time => !Array.from(availableHoursSet).includes(time));
            
            // Debug output
            // console.log(`Field #${fieldId}: Available hours:`, Array.from(availableHoursSet));
            // console.log(`Field #${fieldId}: Booked hours:`, bookedHours);
            
            // Simpan jam yang terpesan untuk lapangan ini
            booked[fieldId] = bookedHours;
          });
        } else {
          console.error('Invalid response format:', responseData);
        }
      } catch (error) {
        console.error("Error fetching field availability:", error);
        
        // Fallback ke metode alternatif jika endpoint utama gagal
        try {
          console.log('Using fallback method for availability');
          const filteredFields = fields.filter(field => field.branchId === selectedBranch);
          
          // Inisialisasi booked entries untuk semua lapangan (penting untuk reset)
          filteredFields.forEach(field => {
            booked[field.id] = [];
          });
          
          // Dapatkan semua booking
          const bookings = await bookingApi.getUserBookings();
          const allBookings = Array.isArray(bookings) ? bookings : [];
          
          // Filter booking berdasarkan tanggal yang dipilih
          const relevantBookings = allBookings.filter((booking: Booking) => {
            const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
            return bookingDate === selectedDate;
          });
          
          // console.log('Relevant bookings found:', relevantBookings.length);
          
          // Kelompokkan booking berdasarkan lapangan
          relevantBookings.forEach((booking: Booking) => {
            const fieldId = booking.fieldId;
            
            if (!booked[fieldId]) {
              booked[fieldId] = [];
            }
            
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);
            
            // Tandai semua jam dalam rentang sebagai terpesan (inclusive startTime, exclusive endTime)
            // Contoh: Booking 21:00-23:00 akan menandai jam 21:00 dan 22:00 sebagai terpesan
            for (let hour = startTime.getHours(); hour < endTime.getHours(); hour++) {
              const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
              if (!booked[fieldId].includes(timeSlot)) {
                booked[fieldId].push(timeSlot);
              }
            }
          });
        } catch (fallbackError) {
          console.error("Fallback availability fetch failed:", fallbackError);
        }
      }
      
      // console.log('Final booked slots:', booked);
      return booked;
    } catch (error) {
      console.error("Error fetching booked time slots:", error);
      return {};
    }
  }
}

export const fieldApi = new FieldApi(); 