"""
Анимация «Сложение векторов» для модуля I.7 Академии ЭХО.

Рендер:
    manimgl vectors_sum.py VectorSum -o --video_dir ../../public/lessons/manimgx

Сюжетный контекст: ремонтный дрон «Аксиомы» складывает два манёвра,
чтобы достичь узла обслуживания.
"""

from manimlib import *


class VectorSum(Scene):
    def construct(self):
        plane = NumberPlane(
            x_range=(-1, 5), y_range=(-1, 4),
            background_line_style={"stroke_opacity": 0.25},
        )
        self.add(plane)

        title = Text("Сложение векторов: маршрут дрона", font_size=34)
        title.to_edge(UP)
        self.play(Write(title))

        a = Arrow(plane.c2p(0, 0), plane.c2p(1.5, 0.5), buff=0, color=GREY_B)
        a_label = Tex(r"\vec{a}", font_size=36).next_to(a.get_end(), DOWN)

        b = Arrow(plane.c2p(1.5, 0.5), plane.c2p(2.0, 2.0), buff=0, color=YELLOW)
        b_label = Tex(r"\vec{b}", font_size=36).next_to(b.get_end(), RIGHT)

        self.play(GrowArrow(a), FadeIn(a_label))
        self.wait(0.4)
        self.play(GrowArrow(b), FadeIn(b_label))
        self.wait(0.4)

        total = Arrow(plane.c2p(0, 0), plane.c2p(2.0, 2.0), buff=0, color=BLUE)
        total_label = Tex(r"\vec{a}+\vec{b}", font_size=36)
        total_label.next_to(total.get_center(), UL, buff=0.15)

        self.play(GrowArrow(total), FadeIn(total_label))
        self.wait(0.5)

        formula = Tex(
            r"\vec{a}+\vec{b} = \langle a_x+b_x,\ a_y+b_y \rangle",
            font_size=38,
        ).to_edge(DOWN)
        self.play(Write(formula))
        self.wait(1.0)

        note = Text("Складываются покомпонентно", font_size=26, color=BLUE_B)
        note.next_to(formula, UP, buff=0.3)
        self.play(FadeIn(note, shift=UP * 0.2))
        self.wait(1.5)
