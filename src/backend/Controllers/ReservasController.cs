using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/reservas")]
    public class ReservasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReservasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservaAreaComum>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var list = await _context.Reservas
                    .AsNoTracking()
                    .OrderBy(r => r.Id)
                    .ToListAsync(cancellationToken);

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar reservas: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ReservaAreaComum>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var reserva = await _context.Reservas
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

                if (reserva is null)
                {
                    return NotFound();
                }

                return Ok(reserva);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar reserva: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ReservaAreaComum>> Create([FromBody] ReservaAreaComum requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var validationError = ValidateRequest(requestBody);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            try
            {
                if (await ExistsOverlappingReservationAsync(
                        requestBody.AreaComumId,
                        requestBody.DataHoraInicio,
                        requestBody.DataHoraFim,
                        excludeReservaId: null,
                        cancellationToken))
                {
                    return Conflict("Já existe reserva ativa (não cancelada) neste horário para esta área comum.");
                }

                var now = DateTime.UtcNow;
                var entity = new ReservaAreaComum
                {
                    AreaComumId = requestBody.AreaComumId,
                    MoradorId = requestBody.MoradorId,
                    DataHoraInicio = requestBody.DataHoraInicio,
                    DataHoraFim = requestBody.DataHoraFim,
                    Status = requestBody.Status,
                    Observacao = requestBody.Observacao,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                _context.Reservas.Add(entity);
                await _context.SaveChangesAsync(cancellationToken);

                return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar reserva: {ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ReservaAreaComum>> Update(int id, [FromBody] ReservaAreaComum requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var validationError = ValidateRequest(requestBody);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            try
            {
                var entity = await _context.Reservas.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
                if (entity is null)
                {
                    return NotFound();
                }

                if (await ExistsOverlappingReservationAsync(
                        requestBody.AreaComumId,
                        requestBody.DataHoraInicio,
                        requestBody.DataHoraFim,
                        excludeReservaId: id,
                        cancellationToken))
                {
                    return Conflict("Já existe reserva ativa (não cancelada) neste horário para esta área comum.");
                }

                entity.AreaComumId = requestBody.AreaComumId;
                entity.MoradorId = requestBody.MoradorId;
                entity.DataHoraInicio = requestBody.DataHoraInicio;
                entity.DataHoraFim = requestBody.DataHoraFim;
                entity.Status = requestBody.Status;
                entity.Observacao = requestBody.Observacao;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);

                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar reserva: {ex.Message}");
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                var entity = await _context.Reservas.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
                if (entity is null)
                {
                    return NotFound();
                }

                _context.Reservas.Remove(entity);
                await _context.SaveChangesAsync(cancellationToken);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao remover reserva: {ex.Message}");
            }
        }

        /// <summary>
        /// Reservas com status Cancelada ou Rejeitada não ocupam o horário. Equivalente a
        /// <see cref="Services.ReservaConflito.IntervalosSeSobrepoe"/> para o par de intervalos.
        /// </summary>
        private Task<bool> ExistsOverlappingReservationAsync(
            int areaComumId,
            DateTime inicio,
            DateTime fim,
            int? excludeReservaId,
            CancellationToken cancellationToken)
        {
            return _context.Reservas.AnyAsync(
                r => r.AreaComumId == areaComumId
                     && r.Status != ReservationStatus.Cancelada
                     && r.Status != ReservationStatus.Rejeitada
                     && (!excludeReservaId.HasValue || r.Id != excludeReservaId.Value)
                     && r.DataHoraInicio < fim
                     && r.DataHoraFim > inicio,
                cancellationToken);
        }

        private static string? ValidateRequest(ReservaAreaComum requestBody)
        {
            if (requestBody.DataHoraFim <= requestBody.DataHoraInicio)
            {
                return "DataHoraFim deve ser maior que DataHoraInicio.";
            }

            return null;
        }
    }
}
