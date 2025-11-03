# Vercel Environment Variables - Əlavə Edilməli Dəyərlər

Vercel Dashboard-da **Environment Variables** səhifəsində aşağıdakı dəyərləri əlavə edin:

## TMDB API (Film məlumatları üçün)
1. **Key:** `REACT_APP_TMDB_API_KEY`
   **Value:** `50e79d88aac43a5efe24a9eceb69e472`
   **Environments:** Production, Preview, Development

2. **Key:** `REACT_APP_TMDB_READ_ACCESS_TOKEN`
   **Value:** `eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MGU3OWQ4OGFhYzQzYTVlZmUyNGE5ZWNlYjY5ZTQ3MiIsIm5iZiI6MTc0ODYyNDEwOC41OTgsInN1YiI6IjY4MzllMmVjNmNhMmZiMWU2MTk2OTBkYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jp3Tou5htYUC2eNgb11Wn86mrYzbxq_nQLaiKWIoGcc`
   **Environments:** Production, Preview, Development

## Firebase Configuration (İstifadəçi autentifikasiyası və verilənlər üçün)
3. **Key:** `REACT_APP_FIREBASE_API_KEY`
   **Value:** `AIzaSyBFdETSiva84jNkv5s02N1ulfrlLBBjdlg`
   **Environments:** Production, Preview, Development

4. **Key:** `REACT_APP_FIREBASE_AUTH_DOMAIN`
   **Value:** `sayn-movie-app.firebaseapp.com`
   **Environments:** Production, Preview, Development

5. **Key:** `REACT_APP_FIREBASE_PROJECT_ID`
   **Value:** `sayn-movie-app`
   **Environments:** Production, Preview, Development

6. **Key:** `REACT_APP_FIREBASE_STORAGE_BUCKET`
   **Value:** `sayn-movie-app.appspot.com`
   **Environments:** Production, Preview, Development

7. **Key:** `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   **Value:** `202464697737`
   **Environments:** Production, Preview, Development

8. **Key:** `REACT_APP_FIREBASE_APP_ID`
   **Value:** `1:202464697737:web:9da3c72699ed913a38d558`
   **Environments:** Production, Preview, Development

9. **Key:** `REACT_APP_FIREBASE_MEASUREMENT_ID`
   **Value:** `G-D5PMBH11PZ`
   **Environments:** Production, Preview, Development (Optional)

10. **Key:** `REACT_APP_FIREBASE_VAPID_KEY`
    **Value:** `BGk7qUekIh9xqlf-L9J38iuUufyndynO9FA8D3mqiU_Tw-l-4GpU9obBqBgfcSpUFdt4C4u2ism9Ol1VzjzyVtE`
    **Environments:** Production, Preview, Development (Optional - notifications üçün)

---

## Qeyd:
- Hər bir variable üçün **"Add"** düyməsini basın
- **Environment** olaraq "Production", "Preview" və "Development" seçin (hamısını seçin)
- Dəyərləri daxil etdikdən sonra **"Save"** basın
- Sonra deployment-ı **"Redeploy"** edin

## SİLİNMƏLİ:
- `REACT_APP_BACKEND_URL` - Artıq istifadə olunmur, silinə bilər (əgər varsa)

