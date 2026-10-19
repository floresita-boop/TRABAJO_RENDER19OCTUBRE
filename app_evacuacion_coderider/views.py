from django.shortcuts import render, redirect
from .models import Reporte
from .forms import ReporteForm

def evacuacion(request):
    if request.method == 'POST':
        form = ReporteForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('evacuacion')
    else:
        form = ReporteForm()
    
    # Esto se ejecuta tanto en el GET inicial como si el POST falla (para mostrar errores)
    reportes = Reporte.objects.all()
    
    return render(request, 'app_evacuacion_coderider/render.html', {
        'form': form,
        'reportes': reportes,
    })
    
# Create your views here.
